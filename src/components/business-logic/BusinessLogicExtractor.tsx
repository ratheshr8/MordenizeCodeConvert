import React, { useState, useEffect } from 'react';
import { Brain, Edit, Save, RefreshCw, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { BusinessLogicExtractionResult } from '../../types/businessLogic';

interface BusinessLogicExtractorProps {
  extractionResult: BusinessLogicExtractionResult;
  loading: boolean;
  onLogicEdit: (editedLogic: string) => void;
  onProceedToGeneration: () => void;
}

export const BusinessLogicExtractor: React.FC<BusinessLogicExtractorProps> = ({
  extractionResult,
  loading,
  onLogicEdit,
  onProceedToGeneration
}) => {
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLogic, setEditedLogic] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (extractionResult?.extractedLogic) {
      setEditedLogic(extractionResult.extractedLogic);
    }
  }, [extractionResult]);

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

  const handleSaveChanges = () => {
    onLogicEdit(editedLogic);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleEditChange = (value: string) => {
    setEditedLogic(value);
    setHasChanges(value !== extractionResult.extractedLogic);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="text-lg text-gray-600">
            {chunkProgress ? 'Processing large project in chunks...' : 'Extracting business logic with Azure GPT-4...'}
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
                Large projects are processed in smaller chunks for better analysis
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Extraction Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Business Logic Extraction Complete</h3>
          </div>
          <div className={`px-3 py-2 rounded-lg font-medium ${getConfidenceColor(extractionResult.confidence)}`}>
            {extractionResult.confidence}% Confidence
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">{extractionResult.summary}</p>
        
        {/* Extraction Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{extractionResult.businessRules.length}</div>
            <div className="text-sm text-blue-700">Business Rules</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{extractionResult.dataModels.length}</div>
            <div className="text-sm text-purple-700">Data Models</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{extractionResult.workflows.length}</div>
            <div className="text-sm text-green-700">Workflows</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{extractionResult.businessProcesses.length}</div>
            <div className="text-sm text-orange-700">Processes</div>
          </div>
        </div>
      </div>

      {/* Business Logic Editor */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Edit className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-800">Extracted Business Logic</h3>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Logic</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedLogic(extractionResult.extractedLogic);
                    setHasChanges(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    hasChanges
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Editing Business Logic</span>
              </div>
              <p className="text-blue-700 text-sm">
                You can modify the extracted business logic below. This will be used to generate the complete new application.
                Make sure to maintain the core business requirements while improving clarity and completeness.
              </p>
            </div>
            
            <textarea
              value={editedLogic}
              onChange={(e) => handleEditChange(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Edit the business logic here..."
            />
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Lines: {editedLogic.split('\n').length} | Characters: {editedLogic.length}</span>
              {hasChanges && (
                <span className="text-orange-600 font-medium">Unsaved changes</span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="text-sm text-gray-800 overflow-auto max-h-96 whitespace-pre-wrap">
              {extractionResult.extractedLogic}
            </pre>
          </div>
        )}
      </div>

      {/* Business Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Rules */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-gray-800">Business Rules</h4>
          </div>
          <div className="space-y-2">
            {extractionResult.businessRules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Models */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-purple-500" />
            <h4 className="text-lg font-semibold text-gray-800">Data Models</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractionResult.dataModels.map((model, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Workflows and Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="h-5 w-5 text-green-500" />
            <h4 className="text-lg font-semibold text-gray-800">Workflows</h4>
          </div>
          <div className="space-y-2">
            {extractionResult.workflows.map((workflow, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="text-gray-700 text-sm">{workflow}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Processes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-5 w-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-gray-800">Business Processes</h4>
          </div>
          <div className="space-y-2">
            {extractionResult.businessProcesses.map((process, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                <span className="text-gray-700 text-sm">{process}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {extractionResult.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-800">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {extractionResult.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  !
                </span>
                <span className="text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed to Generation */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Generate Complete Project</h3>
            <p className="text-gray-600">
              The business logic has been extracted and is ready for project generation. 
              {hasChanges && ' Please save your changes before proceeding.'}
            </p>
          </div>
          <button
            onClick={onProceedToGeneration}
            disabled={hasChanges || isEditing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              hasChanges || isEditing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span>Generate Complete Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};