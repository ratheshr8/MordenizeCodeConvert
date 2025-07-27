import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import { ProjectFrameworkSelector } from './ProjectFrameworkSelector';
import { ProjectMigrationOptions } from './ProjectMigrationOptions';
import { ProjectFileSelector } from './ProjectFileSelector';
import { ProjectAnalysisResults } from './ProjectAnalysisResults';
import { ProjectMigrationResults } from './ProjectMigrationResults';
import { StepIndicator } from '../StepIndicator';
import { projectMigrationAIService } from '../../services/projectMigrationAI';
import { 
  ProjectMigrationOptions as ProjectMigrationOptionsType, 
  ProjectFile, 
  ProjectAnalysisResult, 
  ProjectMigrationResult
} from '../../types/projectMigration';

type ProjectMigrationStep = 'setup' | 'files' | 'analysis' | 'migration';

interface ProjectMigrationWizardProps {
  onBackToMain?: () => void;
}

export const ProjectMigrationWizard: React.FC<ProjectMigrationWizardProps> = ({ onBackToMain }) => {
  const [currentStep, setCurrentStep] = useState<ProjectMigrationStep>('setup');
  const [sourceFramework, setSourceFramework] = useState<string | null>(null);
  const [targetFramework, setTargetFramework] = useState<string | null>(null);
  const [migrationOptions, setMigrationOptions] = useState<ProjectMigrationOptionsType>({
    preserveArchitecture: true,
    modernizePatterns: true,
    updateDependencies: true,
    generateTests: true,
    createDocumentation: true,
    optimizePerformance: true,
    addSecurity: true,
    includeCI: false
  });
  const [selectedFiles, setSelectedFiles] = useState<ProjectFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<ProjectMigrationResult | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  const steps = [
    { id: 'setup', title: 'Framework & Options', completed: currentStep !== 'setup', active: currentStep === 'setup' },
    { id: 'files', title: 'Project Selection', completed: ['analysis', 'migration'].includes(currentStep), active: currentStep === 'files' },
    { id: 'analysis', title: 'Project Analysis', completed: currentStep === 'migration', active: currentStep === 'analysis' },
    { id: 'migration', title: 'Project Migration', completed: false, active: currentStep === 'migration' }
  ];

  const canProceedFromSetup = sourceFramework && targetFramework;
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
            const analysis = await projectMigrationAIService.analyzeProject(selectedFiles, sourceFramework!);
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
        setCurrentStep('migration');
        setMigrationLoading(true);
        setMigrationError(null);
        try {
          const result = await projectMigrationAIService.migrateProject(
            selectedFiles,
            sourceFramework!,
            targetFramework!,
            migrationOptions
          );
          setMigrationResult(result);
        } catch (error) {
          console.error('Migration failed:', error);
          setMigrationError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
          setMigrationLoading(false);
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
      case 'migration':
        setCurrentStep('analysis');
        setMigrationError(null);
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProjectFrameworkSelector
                selectedFramework={sourceFramework}
                onFrameworkSelect={setSourceFramework}
                title="Source Framework"
                type="source"
              />
              <ProjectFrameworkSelector
                selectedFramework={targetFramework}
                onFrameworkSelect={setTargetFramework}
                title="Target Framework"
                type="target"
                sourceFramework={sourceFramework}
              />
            </div>
            <ProjectMigrationOptions
              options={migrationOptions}
              onOptionsChange={setMigrationOptions}
              sourceFramework={sourceFramework}
              targetFramework={targetFramework}
            />
          </div>
        );
      
      case 'files':
        return (
          <ProjectFileSelector
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          );
        }
        return (
          <ProjectAnalysisResults
            analysis={analysisResult!}
            loading={analysisLoading}
          />
        );
      
      case 'migration':
        if (migrationError) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Project Migration Failed</div>
                <div className="text-gray-600 mb-4">{migrationError}</div>
                <button
                  onClick={() => handleNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Migration
                </button>
              </div>
            </div>
          );
        }
        if (migrationLoading) {
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg text-gray-600">Migrating project with Azure GPT-4...</span>
              </div>
            </div>
          );
        }
        return migrationResult ? (
          <ProjectMigrationResults result={migrationResult} />
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
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Full Project Migration</h1>
                <p className="text-gray-600">Migrate entire projects between frameworks using AI-powered analysis and conversion</p>
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

          {currentStep === 'migration' ? (
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
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentStep === 'setup' ? 'Select Project Files' :
                 currentStep === 'files' ? 'Analyze Project' :
                 'Migrate Project'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};