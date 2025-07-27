import React, { useState, useEffect } from 'react';
import { Brain, Code, Workflow, Lightbulb, Edit, Play, Save } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { azureAIService } from '../../services/azureAI';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  loading: boolean;
  files: any[];
  sourceLanguage: string;
  targetLanguage: string;
  conversionOptions: any;
  onBusinessLogicConversion: (result: any) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  loading,
  files,
  sourceLanguage,
  targetLanguage,
  conversionOptions,
  onBusinessLogicConversion
}) => {
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [showBusinessLogicEditor, setShowBusinessLogicEditor] = useState(false);
  const [businessLogic, setBusinessLogic] = useState('');
  const [editedBusinessLogic, setEditedBusinessLogic] = useState('');
  const [extractingLogic, setExtractingLogic] = useState(false);
  const [convertingLogic, setConvertingLogic] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    const handleChunkProgress = (event: CustomEvent) => {
      setChunkProgress(event.detail);
    };

    const handleChunkProgressTyped = (event: Event) => {
      handleChunkProgress(event as CustomEvent);
    };

    window.addEventListener('chunkProgress', handleChunkProgressTyped);

    return () => {
      window.removeEventListener('chunkProgress', handleChunkProgressTyped);
      setChunkProgress(null);
    };
  }, []);

  const handleGenerateCodeFromAnalysis = async () => {
    if (!files.length || !sourceLanguage) {
      alert('Missing required data for business logic extraction');
      return;
    }

    setExtractingLogic(true);
    setExtractError(null);
    try {
      const logic = await azureAIService.extractBusinessLogic(files, sourceLanguage);
      setBusinessLogic(logic);
      setEditedBusinessLogic(logic);
      setShowBusinessLogicEditor(true);
    } catch (error) {
      console.error('Failed to extract business logic:', error);
      setExtractError(error instanceof Error ? error.message : 'Failed to extract business logic');
    } finally {
      setExtractingLogic(false);
    }
  };

  const handleConvertBusinessLogic = async () => {
    if (!editedBusinessLogic.trim() || !targetLanguage) {
      alert('Please ensure business logic is available and target language is selected');
      return;
    }

    setConvertingLogic(true);
    try {
      const result = await azureAIService.convertBusinessLogicToCode(
        editedBusinessLogic,
        targetLanguage,
        conversionOptions
      );
      
      if (onBusinessLogicConversion) {
        onBusinessLogicConversion(result);
      }
      
      setShowBusinessLogicEditor(false);
    } catch (error) {
      console.error('Failed to convert business logic:', error);
      alert('Failed to convert business logic to code. Please try again.');
    } finally {
      setConvertingLogic(false);
    }
  };

  const handleSaveBusinessLogic = () => {
    setBusinessLogic(editedBusinessLogic);
    alert('Business logic saved successfully!');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="text-lg text-gray-600">
            {chunkProgress ? 'Processing large file in chunks...' : 'Analyzing code with Azure GPT-4...'}
          </span>
          
          {chunkProgress && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing chunks</span>
                <span>{chunkProgress.current} of {chunkProgress.total} ({chunkProgress.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${chunkProgress.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Large files are processed in smaller chunks for better performance
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showBusinessLogicEditor) {
    return (
      <div className="space-y-6">
        {/* Business Logic Editor Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Edit className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-800">Edit Business Logic</h3>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveBusinessLogic}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Save Logic</span>
              </button>
              <button
                onClick={() => setShowBusinessLogicEditor(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Back to Analysis
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Review and edit the extracted business logic below. You can modify the logic to better represent your requirements before converting to {targetLanguage}.
          </p>
        </div>

        {/* Business Logic Editor */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logic (Pseudocode)
            </label>
            <textarea
              value={editedBusinessLogic}
              onChange={(e) => setEditedBusinessLogic(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Business logic will appear here..."
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Lines: {editedBusinessLogic.split('\n').length} | Characters: {editedBusinessLogic.length}
            </div>
            <button
              onClick={handleConvertBusinessLogic}
              disabled={convertingLogic || !editedBusinessLogic.trim()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                convertingLogic || !editedBusinessLogic.trim()
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Play className="h-4 w-4" />
              <span>{convertingLogic ? 'Converting...' : `Convert to ${targetLanguage}`}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Code from Analysis Button */}
      {!loading && analysis && files && files.length > 0 && sourceLanguage && targetLanguage && (
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Generate Code from Analysis</h3>
                <p className="text-gray-600 text-sm">Extract business logic and convert it to {targetLanguage}</p>
              </div>
            </div>
            <button
              onClick={handleGenerateCodeFromAnalysis}
              disabled={extractingLogic}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                extractingLogic
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Edit className="h-4 w-4" />
              <span>{extractingLogic ? 'Extracting Logic...' : 'Generate Code from Analysis'}</span>
            </button>
          </div>
          {extractError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{extractError}</p>
            </div>
          )}
        </div>
      )}

      {/* Language Features */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6 text-brand-orange-500" />
          <h3 className="text-xl font-semibold text-gray-800">Language Features Detected</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.languageFeatures.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-brand-orange-100 text-brand-orange-800 rounded-full text-sm font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* What This Code Does */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Code className="h-6 w-6 text-brand-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">What This Code Does</h3>
        </div>
        
        <div className="space-y-6">
          {/* Program Overview */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">Program Overview</h4>
            <p className="text-gray-600 leading-relaxed">{analysis.programOverview}</p>
          </div>

          {/* Business Logic */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">Business Logic</h4>
            <ul className="space-y-2">
              {analysis.businessLogic.map((logic, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-brand-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600">{logic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Processing Flow */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">Data Processing Flow</h4>
            <div className="space-y-3">
              {analysis.dataProcessingFlow.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-blue-100 text-brand-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-600">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-brand-orange-500" />
          <h3 className="text-xl font-semibold text-gray-800">Conversion Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-brand-orange-50 rounded-lg">
              <span className="w-6 h-6 bg-brand-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                !
              </span>
              <span className="text-gray-700">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};