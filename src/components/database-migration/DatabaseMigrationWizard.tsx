import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Database } from 'lucide-react';
import { DatabaseSelector } from './DatabaseSelector';
import { DatabaseConversionOptions } from './DatabaseConversionOptions';
import { DatabaseFileSelector } from './DatabaseFileSelector';
import { DatabaseAnalysisResults } from './DatabaseAnalysisResults';
import { DatabaseConversionResults } from './DatabaseConversionResults';
import { StepIndicator } from '../StepIndicator';
import { databaseAIService } from '../../services/databaseAI';
import { 
  DatabaseConversionOptions as DatabaseConversionOptionsType, 
  DatabaseFile, 
  DatabaseAnalysisResult, 
  DatabaseConversionResult
} from '../../types/database';

type DatabaseStep = 'setup' | 'files' | 'analysis' | 'conversion';

interface DatabaseMigrationWizardProps {
  onBackToMain?: () => void;
}

export const DatabaseMigrationWizard: React.FC<DatabaseMigrationWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<DatabaseStep>('setup');
  const [sourceDatabase, setSourceDatabase] = useState<string | null>(null);
  const [targetDatabase, setTargetDatabase] = useState<string | null>(null);
  const [conversionOptions, setConversionOptions] = useState<DatabaseConversionOptionsType>({
    preserveConstraints: true,
    generateIndexes: true,
    optimizeQueries: true,
    includeTestData: false,
    generateMigrationScripts: true
  });
  const [selectedFiles, setSelectedFiles] = useState<DatabaseFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DatabaseAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<DatabaseConversionResult | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const steps = [
    { id: 'setup', title: 'Database & Options', completed: currentStep !== 'setup', active: currentStep === 'setup' },
    { id: 'files', title: 'File Selection', completed: ['analysis', 'conversion'].includes(currentStep), active: currentStep === 'files' },
    { id: 'analysis', title: 'Database Analysis', completed: currentStep === 'conversion', active: currentStep === 'analysis' },
    { id: 'conversion', title: 'Database Conversion', completed: false, active: currentStep === 'conversion' }
  ];

  const canProceedFromSetup = sourceDatabase && targetDatabase;
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
            const analysis = await databaseAIService.analyzeDatabase(selectedFiles, sourceDatabase!);
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
        setCurrentStep('conversion');
        setConversionLoading(true);
        setConversionError(null);
        try {
          const result = await databaseAIService.convertDatabase(
            selectedFiles,
            sourceDatabase!,
            targetDatabase!,
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
      case 'conversion':
        setCurrentStep('analysis');
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
              <DatabaseSelector
                selectedDatabase={sourceDatabase}
                onDatabaseSelect={setSourceDatabase}
                title="Source Database"
                type="source"
              />
              <DatabaseSelector
                selectedDatabase={targetDatabase}
                onDatabaseSelect={setTargetDatabase}
                title="Target Database"
                type="target"
                sourceDatabase={sourceDatabase}
              />
            </div>
            <DatabaseConversionOptions
              options={conversionOptions}
              onOptionsChange={setConversionOptions}
              sourceDatabase={sourceDatabase}
              targetDatabase={targetDatabase}
            />
          </div>
        );
      
      case 'files':
        return (
          <DatabaseFileSelector
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          );
        }
        return (
          <DatabaseAnalysisResults
            analysis={analysisResult!}
            loading={analysisLoading}
          />
        );
      
      case 'conversion':
        if (conversionError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Database Conversion Failed</div>
                <div className="text-gray-600 mb-4">{conversionError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <span className="ml-4 text-lg text-gray-600">Converting database with Azure GPT-4...</span>
              </div>
            </div>
          );
        }
        return conversionResult ? (
          <DatabaseConversionResults result={conversionResult} />
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
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Database Schema & Query Converter</h1>
                <p className="text-gray-600">Transform SQL queries, schema definitions, and stored procedures between database types</p>
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
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentStep === 'setup' ? 'Select Files' :
                 currentStep === 'files' ? 'Analyze Database' :
                 'Convert Database'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};