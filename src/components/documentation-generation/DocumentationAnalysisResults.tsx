import React from 'react';
import { useState, useEffect } from 'react';
import { Code, Layers, Globe, Package, BarChart3, Lightbulb } from 'lucide-react';
import { DocumentationAnalysisResult } from '../../types/documentation';

interface DocumentationAnalysisResultsProps {
  analysis: DocumentationAnalysisResult;
  loading: boolean;
}

export const DocumentationAnalysisResults: React.FC<DocumentationAnalysisResultsProps> = ({
  analysis,
  loading
}) => {
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="text-lg text-gray-600">
            {chunkProgress ? 'Processing large file in chunks...' : 'Analyzing code structure with Azure GPT-4...'}
          </span>
          
          {chunkProgress && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing chunks</span>
                <span>{chunkProgress.current} of {chunkProgress.total} ({chunkProgress.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out"
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

  return (
    <div className="space-y-6">
      {/* Code Structure */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Layers className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Code Structure</h3>
        </div>
        <div className="space-y-3">
          {analysis.codeStructure.map((structure, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{structure}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Components */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Code className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Main Components</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.mainComponents.map((component, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {component}
            </span>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      {analysis.apiEndpoints.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-6 w-6 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-800">API Endpoints</h3>
          </div>
          <div className="space-y-2">
            {analysis.apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 font-mono text-sm">{endpoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-gray-800">Dependencies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.dependencies.map((dependency, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
            >
              {dependency}
            </span>
          ))}
        </div>
      </div>

      {/* Complexity Assessment */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-800">Complexity Assessment</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-lg font-medium ${
            analysis.complexity === 'Low' ? 'bg-green-100 text-green-800' :
            analysis.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {analysis.complexity} Complexity
          </div>
          <div className="text-sm text-gray-600">
            This affects the documentation approach and level of detail required.
          </div>
        </div>
      </div>

      {/* Documentation Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800">Documentation Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
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