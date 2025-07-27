import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Brain } from 'lucide-react';
import { BusinessLogicProjectSelector } from './BusinessLogicProjectSelector';
import { BusinessLogicExtractor } from './BusinessLogicExtractor';
import { TargetFrameworkSelector } from './TargetFrameworkSelector';
import { BusinessLogicGenerationOptions } from './BusinessLogicGenerationOptions';
import { BusinessLogicGenerationResults } from './BusinessLogicGenerationResults';
import { StepIndicator } from '../StepIndicator';
import { businessLogicAIService } from '../../services/businessLogicAI';
import { 
  BusinessLogicFile,
  BusinessLogicExtractionResult,
  BusinessLogicGenerationOptions as BusinessLogicGenerationOptionsType,
  BusinessLogicGenerationResult
} from '../../types/businessLogic';

type BusinessLogicStep = 'upload' | 'extraction' | 'framework' | 'options' | 'generation';

interface BusinessLogicWizardProps {
  onBackToMain?: () => void;
}

export const BusinessLogicWizard: React.FC<BusinessLogicWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<BusinessLogicStep>('upload');
  const [selectedFiles, setSelectedFiles] = useState<BusinessLogicFile[]>([]);
  const [extractionResult, setExtractionResult] = useState<BusinessLogicExtractionResult | null>(null);
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [editedBusinessLogic, setEditedBusinessLogic] = useState<string>('');
  const [targetFramework, setTargetFramework] = useState<string | null>(null);
  const [generationOptions, setGenerationOptions] = useState<BusinessLogicGenerationOptionsType>({
    targetFramework: '',
    includeDatabase: true,
    includeAPI: true,
    includeFrontend: true,
    includeTests: true,
    includeDocumentation: true,
    includeDeployment: true,
    addAuthentication: true,
    addLogging: true,
    addErrorHandling: true,
    optimizePerformance: true,
    followBestPractices: true
  });
  const [generationResult, setGenerationResult] = useState<BusinessLogicGenerationResult | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const steps = [
    { id: 'upload', title: 'Upload Project', completed: currentStep !== 'upload', active: currentStep === 'upload' },
    { id: 'extraction', title: 'Extract Business Logic', completed: ['framework', 'options', 'generation'].includes(currentStep), active: currentStep === 'extraction' },
    { id: 'framework', title: 'Select Framework', completed: ['options', 'generation'].includes(currentStep), active: currentStep === 'framework' },
    { id: 'options', title: 'Generation Options', completed: currentStep === 'generation', active: currentStep === 'options' },
    { id: 'generation', title: 'Generate Project', completed: false, active: currentStep === 'generation' }
  ];

  const canProceedFromUpload = selectedFiles.length > 0;
  const canProceedFromFramework = targetFramework !== null;

  // Check if Azure OpenAI is configured
  const isConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

  const handleNext = async () => {
    switch (currentStep) {
      case 'upload':
        if (canProceedFromUpload) {
          setCurrentStep('extraction');
          setExtractionLoading(true);
          setExtractionError(null);
          try {
            const result = await businessLogicAIService.extractBusinessLogic(selectedFiles);
            setExtractionResult(result);
            setEditedBusinessLogic(result.extractedLogic);
          } catch (error) {
            console.error('Business logic extraction failed:', error);
            setExtractionError(error instanceof Error ? error.message : 'Business logic extraction failed');
          } finally {
            setExtractionLoading(false);
          }
        }
        break;
      case 'extraction':
        setCurrentStep('framework');
        break;
      case 'framework':
        if (canProceedFromFramework) {
          setCurrentStep('options');
          setGenerationOptions(prev => ({ ...prev, targetFramework: targetFramework! }));
        }
        break;
      case 'options':
        setCurrentStep('generation');
        setGenerationLoading(true);
        setGenerationError(null);
        try {
          const result = await businessLogicAIService.generateCompleteProject(
            editedBusinessLogic,
            targetFramework!,
            generationOptions
          );
          setGenerationResult(result);
        } catch (error) {
          console.error('Project generation failed:', error);
          setGenerationError(error instanceof Error ? error.message : 'Project generation failed');
        } finally {
          setGenerationLoading(false);
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'extraction':
        setCurrentStep('upload');
        setExtractionError(null);
        break;
      case 'framework':
        setCurrentStep('extraction');
        break;
      case 'options':
        setCurrentStep('framework');
        break;
      case 'generation':
        setCurrentStep('options');
        setGenerationError(null);
        break;
    }
  };

  const handleLogicEdit = (editedLogic: string) => {
    setEditedBusinessLogic(editedLogic);
  };

  const handleProceedToGeneration = () => {
    setCurrentStep('framework');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <BusinessLogicProjectSelector
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
          />
        );
      
      case 'extraction':
        if (extractionError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Business Logic Extraction Failed</div>
                <div className="text-gray-600 mb-4">{extractionError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Extraction
                </button>
              </div>
            </div>
          );
        }
        return (
          <BusinessLogicExtractor
            extractionResult={extractionResult!}
            loading={extractionLoading}
            onLogicEdit={handleLogicEdit}
            onProceedToGeneration={handleProceedToGeneration}
          />
        );
      
      case 'framework':
        return (
          <TargetFrameworkSelector
            selectedFramework={targetFramework}
            onFrameworkSelect={setTargetFramework}
            businessLogicType="default"
          />
        );
      
      case 'options':
        return (
          <BusinessLogicGenerationOptions
            options={generationOptions}
            onOptionsChange={setGenerationOptions}
            targetFramework={targetFramework}
          />
        );
      
      case 'generation':
        if (generationError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Project Generation Failed</div>
                <div className="text-gray-600 mb-4">{generationError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg text-gray-600">Generating complete project with Azure GPT-4...</span>
              </div>
            </div>
          );
        }
        return generationResult ? (
          <BusinessLogicGenerationResults result={generationResult} />
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
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Business Logic Extractor & Project Generator</h1>
                <p className="text-gray-600">Extract business logic from existing projects and generate complete new applications</p>
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
            disabled={currentStep === 'upload'}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'upload'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep === 'generation' ? (
            <button
              onClick={() => setCurrentStep('upload')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Complete</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                !isConfigured ||
                (currentStep === 'upload' && !canProceedFromUpload) ||
                (currentStep === 'framework' && !canProceedFromFramework) ||
                extractionLoading ||
                generationLoading
              }
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !isConfigured ||
                (currentStep === 'upload' && !canProceedFromUpload) ||
                (currentStep === 'framework' && !canProceedFromFramework) ||
                extractionLoading ||
                generationLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentStep === 'upload' ? 'Extract Business Logic' :
                 currentStep === 'extraction' ? 'Select Framework' :
                 currentStep === 'framework' ? 'Configure Options' :
                 currentStep === 'options' ? 'Generate Complete Project' :
                 'Next'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};