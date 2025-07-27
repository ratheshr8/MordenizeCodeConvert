import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { DocumentationTypeSelector } from './DocumentationTypeSelector';
import { DocumentationOptions } from './DocumentationOptions';
import { CodeFileSelector } from './CodeFileSelector';
import { DocumentationAnalysisResults } from './DocumentationAnalysisResults';
import { DocumentationResults } from './DocumentationResults';
import { StepIndicator } from './StepIndicator';
import { documentationAIService } from '../services/documentationAI';
import { 
  DocumentationOptions as DocumentationOptionsType, 
  CodeFile, 
  DocumentationAnalysisResult, 
  DocumentationResult
} from '../types/documentation';

type DocumentationStep = 'setup' | 'files' | 'analysis' | 'generation';

interface DocumentationGeneratorWizardProps {
  onBackToMain?: () => void;
}

export const DocumentationGeneratorWizard: React.FC<DocumentationGeneratorWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<DocumentationStep>('setup');
  const [documentationType, setDocumentationType] = useState<string | null>(null);
  const [documentationOptions, setDocumentationOptions] = useState<DocumentationOptionsType>({
    includeCodeExamples: true,
    generateDiagrams: true,
    includeAPIReference: true,
    addInstallationGuide: true,
    generateTOC: true,
    includeChangelog: false
  });
  const [selectedFiles, setSelectedFiles] = useState<CodeFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DocumentationAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [documentationResult, setDocumentationResult] = useState<DocumentationResult | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const steps = [
    { id: 'setup', title: 'Documentation Type & Options', completed: currentStep !== 'setup', active: currentStep === 'setup' },
    { id: 'files', title: 'Code Selection', completed: ['analysis', 'generation'].includes(currentStep), active: currentStep === 'files' },
    { id: 'analysis', title: 'Code Analysis', completed: currentStep === 'generation', active: currentStep === 'analysis' },
    { id: 'generation', title: 'Documentation Generation', completed: false, active: currentStep === 'generation' }
  ];

  const canProceedFromSetup = documentationType;
  const canProceedFromFiles = selectedFiles.length > 0;

  // Check if Azure OpenAI is configured
  const isConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

  // Detect primary language from selected files
  const getPrimaryLanguage = () => {
    if (selectedFiles.length === 0) return null;
    const languageCounts = selectedFiles.reduce((acc, file) => {
      acc[file.language] = (acc[file.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(languageCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 'setup':
        if (canProceedFromSetup) {
          setCurrentStep('files');
        }
        break;
      case 'files':
        if (canProceedFromFiles) {
          setCurrentStep('analysis');
          setAnalysisLoading(true);
          setAnalysisError(null);
          try {
            const analysis = await documentationAIService.analyzeCodeForDocumentation(selectedFiles);
            setAnalysisResult(analysis);
          } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
          } finally {
            setAnalysisLoading(false);
          }
        }
        break;
      case 'analysis':
        setCurrentStep('generation');
        setGenerationLoading(true);
        setGenerationError(null);
        try {
          const result = await documentationAIService.generateDocumentation(
            selectedFiles,
            documentationType!,
            documentationOptions
          );
          setDocumentationResult(result);
        } catch (error) {
          console.error('Documentation generation failed:', error);
          setGenerationError(error instanceof Error ? error.message : 'Documentation generation failed');
        } finally {
          setGenerationLoading(false);
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'files':
        setCurrentStep('setup');
        break;
      case 'analysis':
        setCurrentStep('files');
        setAnalysisError(null);
        break;
      case 'generation':
        setCurrentStep('analysis');
        setGenerationError(null);
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-8">
            <DocumentationTypeSelector
              selectedType={documentationType}
              onTypeSelect={setDocumentationType}
              title="Select Documentation Type"
              codeLanguage={getPrimaryLanguage()}
            />
            <DocumentationOptions
              options={documentationOptions}
              onOptionsChange={setDocumentationOptions}
              documentationType={documentationType}
            />
          </div>
        );
      
      case 'files':
        return (
          <CodeFileSelector
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
          />
        );
      
      case 'analysis':
        if (analysisError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Analysis Failed</div>
                <div className="text-gray-600 mb-4">{analysisError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          );
        }
        return (
          <DocumentationAnalysisResults
            analysis={analysisResult!}
            loading={analysisLoading}
          />
        );
      
      case 'generation':
        if (generationError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Documentation Generation Failed</div>
                <div className="text-gray-600 mb-4">{generationError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Retry Generation
                </button>
              </div>
            </div>
          );
        }
        if (generationLoading) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <span className="ml-4 text-lg text-gray-600">Generating documentation with Azure GPT-4...</span>
              </div>
            </div>
          );
        }
        return documentationResult ? (
          <DocumentationResults result={documentationResult} />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Code Documentation Generator</h1>
                <p className="text-gray-600">Generate comprehensive documentation for existing codebases using AI</p>
              </div>
            </div>
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Main</span>
              </button>
            )}
          </div>
        </div>

        <StepIndicator steps={steps} />
        
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 'setup'}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'setup'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep === 'generation' ? (
            <button
              onClick={() => setCurrentStep('setup')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Complete</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                !isConfigured ||
                (currentStep === 'setup' && !canProceedFromSetup) ||
                (currentStep === 'files' && !canProceedFromFiles) ||
                analysisLoading
              }
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !isConfigured ||
                (currentStep === 'setup' && !canProceedFromSetup) ||
                (currentStep === 'files' && !canProceedFromFiles) ||
                analysisLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentStep === 'setup' ? 'Select Code Files' :
                 currentStep === 'files' ? 'Analyze Code' :
                 'Generate Documentation'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};