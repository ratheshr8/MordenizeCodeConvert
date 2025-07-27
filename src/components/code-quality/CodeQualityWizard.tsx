import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, BarChart3 } from 'lucide-react';
import { CodeQualityOptions } from './CodeQualityOptions';
import { CodeQualityFileSelector } from './CodeQualityFileSelector';
import { CodeQualityAnalysisResults } from './CodeQualityAnalysisResults';
import { StepIndicator } from '../StepIndicator';
import { codeQualityAIService } from '../../services/codeQualityAI';
import { 
  CodeQualityOptions as CodeQualityOptionsType, 
  CodeQualityFile, 
  CodeQualityAnalysisResult
} from '../../types/codeQuality';

type QualityStep = 'options' | 'files' | 'analysis';

interface CodeQualityWizardProps {
  onBackToMain?: () => void;
}

export const CodeQualityWizard: React.FC<CodeQualityWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<QualityStep>('options');
  const [qualityOptions, setQualityOptions] = useState<CodeQualityOptionsType>({
    checkPerformance: true,
    checkSecurity: true,
    checkMaintainability: true,
    checkReliability: true,
    checkStyle: true,
    includeMetrics: true,
    generateReport: true,
    suggestRefactoring: true
  });
  const [selectedFiles, setSelectedFiles] = useState<CodeQualityFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<CodeQualityAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const steps = [
    { id: 'options', title: 'Analysis Options', completed: currentStep !== 'options', active: currentStep === 'options' },
    { id: 'files', title: 'Code Selection', completed: currentStep === 'analysis', active: currentStep === 'files' },
    { id: 'analysis', title: 'Quality Analysis', completed: false, active: currentStep === 'analysis' }
  ];

  const canProceedFromFiles = selectedFiles.length > 0;

  // Check if Azure OpenAI is configured
  const isConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

  const handleNext = async () => {
    switch (currentStep) {
      case 'options':
        setCurrentStep('files');
        break;
      case 'files':
        if (canProceedFromFiles) {
          setCurrentStep('analysis');
          setAnalysisLoading(true);
          setAnalysisError(null);
          try {
            const analysis = await codeQualityAIService.analyzeCodeQuality(selectedFiles, qualityOptions);
            setAnalysisResult(analysis);
          } catch (error) {
            console.error('Quality analysis failed:', error);
            setAnalysisError(error instanceof Error ? error.message : 'Quality analysis failed');
          } finally {
            setAnalysisLoading(false);
          }
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'files':
        setCurrentStep('options');
        break;
      case 'analysis':
        setCurrentStep('files');
        setAnalysisError(null);
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'options':
        return (
          <CodeQualityOptions
            options={qualityOptions}
            onOptionsChange={setQualityOptions}
          />
        );
      
      case 'files':
        return (
          <CodeQualityFileSelector
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
          />
        );
      
      case 'analysis':
        if (analysisError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Quality Analysis Failed</div>
                <div className="text-gray-600 mb-4">{analysisError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          );
        }
        return (
          <CodeQualityAnalysisResults
            analysis={analysisResult!}
            loading={analysisLoading}
          />
        );
      
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
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Code Quality Analysis</h1>
                <p className="text-gray-600">Analyze code quality, complexity, and maintainability metrics with detailed reports</p>
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
            disabled={currentStep === 'options'}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'options'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep === 'analysis' ? (
            <button
              onClick={() => setCurrentStep('options')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Complete</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                !isConfigured ||
                (currentStep === 'files' && !canProceedFromFiles) ||
                analysisLoading
              }
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !isConfigured ||
                (currentStep === 'files' && !canProceedFromFiles) ||
                analysisLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentStep === 'options' ? 'Select Code Files' : 'Analyze Quality'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};