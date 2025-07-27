import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowLeft as BackIcon, Code } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { ConversionOptions } from './ConversionOptions';
import { FileSelector } from './FileSelector';
import { AnalysisResults } from './AnalysisResults';
import { WorkflowChart } from './WorkflowChart';
import { FlowChart } from './FlowChart';
import { ConversionResults } from './ConversionResults';
import { StepIndicator } from './StepIndicator';
import { azureAIService } from '../services/azureAI';
import { 
  ConversionOptions as ConversionOptionsType, 
  FileItem, 
  AnalysisResult, 
  WorkflowStep, 
  ConversionResult,
  FlowChart as FlowChartType
} from '../types';

type AppStep = 'setup' | 'files' | 'analysis' | 'workflow' | 'conversion';

interface CodeMigrationWizardProps {
  onBackToMain?: () => void;
}

export const CodeMigrationWizard: React.FC<CodeMigrationWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<AppStep>('setup');
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [conversionOptions, setConversionOptions] = useState<ConversionOptionsType>({
    preserveComments: true,
    generateDocs: true,
    optimizeCode: true,
    includeTests: false
  });
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [flowChart, setFlowChart] = useState<FlowChartType | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const handleGenerateWorkflow = async () => {
    setWorkflowError(null);
    setWorkflowLoading(true);
    try {
      const [workflow, flowChartData] = await Promise.all([
        azureAIService.generateWorkflow(sourceLanguage!, targetLanguage!),
        azureAIService.generateFlowChart(selectedFiles, sourceLanguage!)
      ]);
      setWorkflowSteps(workflow);
      setFlowChart(flowChartData);
    } catch (error) {
      console.error('Workflow generation failed:', error);
      setWorkflowError(error instanceof Error ? error.message : 'Workflow generation failed');
    } finally {
      setWorkflowLoading(false);
    }
  };

  const steps = [
    { id: 'setup', title: 'Language & Options', completed: currentStep !== 'setup', active: currentStep === 'setup' },
    { id: 'files', title: 'File Selection', completed: ['analysis', 'workflow', 'conversion'].includes(currentStep), active: currentStep === 'files' },
    { id: 'analysis', title: 'AI Analysis', completed: ['workflow', 'conversion'].includes(currentStep), active: currentStep === 'analysis' },
    { id: 'workflow', title: 'Workflow Generation', completed: currentStep === 'conversion', active: currentStep === 'workflow' },
    { id: 'conversion', title: 'Code Conversion', completed: false, active: currentStep === 'conversion' }
  ];

  const canProceedFromSetup = sourceLanguage && targetLanguage;
  const canProceedFromFiles = selectedFiles.length > 0;

  // Check if Azure OpenAI is configured
  const isConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

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
            const analysis = await azureAIService.analyzeCode(selectedFiles, sourceLanguage!);
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
        setCurrentStep('workflow');
        break;
      case 'workflow':
        setCurrentStep('conversion');
        setConversionLoading(true);
        setConversionError(null);
        try {
          const result = await azureAIService.convertCode(
            selectedFiles,
            sourceLanguage!,
            targetLanguage!,
            conversionOptions
          );
          setConversionResult(result);
        } catch (error) {
          console.error('Conversion failed:', error);
          setConversionError(error instanceof Error ? error.message : 'Conversion failed');
        } finally {
          setConversionLoading(false);
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
      case 'workflow':
        setCurrentStep('analysis');
        setWorkflowError(null);
        break;
      case 'conversion':
        setCurrentStep('workflow');
        setConversionError(null);
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LanguageSelector
                selectedLanguage={sourceLanguage}
                onLanguageSelect={setSourceLanguage}
                title="Source Language"
                type="source"
              />
              <LanguageSelector
                selectedLanguage={targetLanguage}
                onLanguageSelect={setTargetLanguage}
                title="Target Language"
                type="target"
                sourceLanguage={sourceLanguage}
              />
            </div>
            <ConversionOptions
              options={conversionOptions}
              onOptionsChange={setConversionOptions}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          </div>
        );
      
      case 'files':
        return (
          <FileSelector
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
                  className="px-6 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          );
        }
        return (
          <AnalysisResults
            analysis={analysisResult!}
            loading={analysisLoading}
          />
        );
      
      case 'workflow':
        if (workflowLoading) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg text-gray-600">Generating workflow and flow chart with AI...</span>
              </div>
            </div>
          );
        }
        
        if (workflowSteps.length === 0 && !workflowError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate Conversion Workflow</h3>
                <p className="text-gray-600 mb-6">
                  Click the button below to analyze your {sourceLanguage} code and generate a detailed workflow and flow chart showing the program's logic flow.
                </p>
                <button
                  onClick={handleGenerateWorkflow}
                  disabled={workflowLoading}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    workflowLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700'
                  }`}
                >
                  {workflowLoading ? 'Analyzing Code...' : 'Analyze Code & Generate Flow Chart'}
                </button>
              </div>
            </div>
          );
        }
        
        if (workflowError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Workflow Generation Failed</div>
                <div className="text-gray-600 mb-4">{workflowError}</div>
                <button
                  onClick={handleGenerateWorkflow}
                  disabled={workflowLoading}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                    workflowLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700'
                  }`}
                >
                  {workflowLoading ? 'Generating...' : 'Retry Workflow Generation'}
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-8">
            {flowChart && <FlowChart flowChart={flowChart} />}
          </div>
        );
      
      case 'conversion':
        if (conversionError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Code Conversion Failed</div>
                <div className="text-gray-600 mb-4">{conversionError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700"
                >
                  Retry Conversion
                </button>
              </div>
            </div>
          );
        }
        if (conversionLoading) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg text-gray-600">Converting code with AI...</span>
              </div>
            </div>
          );
        }
        return conversionResult ? (
          <ConversionResults result={conversionResult} />
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
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Code Language Converter</h1>
              <p className="text-gray-600">Convert legacy code to modern languages using AI-powered analysis</p>
            </div>
          </div>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <BackIcon className="h-4 w-4" />
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

        {currentStep === 'conversion' ? (
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
                : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <span>
              {currentStep === 'setup' ? 'Select Files' :
               currentStep === 'files' ? 'Analyze Code' :
               currentStep === 'analysis' ? 'Generate Workflow' :
               'Convert Code'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
      </div>
    </div>
  );
};