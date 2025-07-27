import React, { useState, useEffect } from 'react';
import { Building, Package, Layers, AlertTriangle, Lightbulb, Clock, BarChart3 } from 'lucide-react';
import { ProjectAnalysisResult } from '../../types/projectMigration';

interface ProjectAnalysisResultsProps {
  analysis: ProjectAnalysisResult;
  loading: boolean;
}

export const ProjectAnalysisResults: React.FC<ProjectAnalysisResultsProps> = ({
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="text-lg text-gray-600">
            {chunkProgress ? 'Processing large project in chunks...' : 'Analyzing project with Azure GPT-4...'}
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
                Large projects are processed in smaller chunks for better performance
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Small': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Large': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Project Analysis Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Project Complexity</h4>
              <div className={`inline-flex items-center px-3 py-2 rounded-lg font-medium ${getComplexityColor(analysis.complexity)}`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {analysis.complexity} Complexity
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Estimated Migration Effort</h4>
              <div className={`inline-flex items-center px-3 py-2 rounded-lg font-medium ${getEffortColor(analysis.estimatedEffort)}`}>
                <Clock className="h-4 w-4 mr-2" />
                {analysis.estimatedEffort} Effort
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{analysis.frameworks.length}</div>
                  <div className="text-xs text-blue-700">Frameworks</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">{analysis.dependencies.length}</div>
                  <div className="text-xs text-purple-700">Dependencies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Patterns */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Architecture Patterns</h3>
        </div>
        <div className="space-y-3">
          {analysis.architecture.map((pattern, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{pattern}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frameworks & Technologies */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Layers className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Frameworks & Technologies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.frameworks.map((framework, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
            >
              {framework}
            </span>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Key Dependencies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.dependencies.map((dependency, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {dependency}
            </span>
          ))}
        </div>
      </div>

      {/* Design Patterns */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Layers className="h-6 w-6 text-indigo-500" />
          <h3 className="text-xl font-semibold text-gray-800">Design Patterns</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.patterns.map((pattern, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>

      {/* Migration Challenges */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-800">Migration Challenges</h3>
        </div>
        <div className="space-y-3">
          {analysis.migrationChallenges.map((challenge, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-800">{challenge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800">Migration Recommendations</h3>
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