import React from 'react';
import { Database, Search, AlertTriangle, Lightbulb } from 'lucide-react';
import { DatabaseAnalysisResult } from '../types/database';

interface DatabaseAnalysisResultsProps {
  analysis: DatabaseAnalysisResult;
  loading: boolean;
}

export const DatabaseAnalysisResults: React.FC<DatabaseAnalysisResultsProps> = ({
  analysis,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-lg text-gray-600">Analyzing database with AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schema Structure */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Database Schema Structure</h3>
        </div>
        <div className="space-y-3">
          {analysis.schemaStructure.map((structure, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{structure}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Query Patterns */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Query Patterns Detected</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.queryPatterns.map((pattern, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>

      {/* Complexity Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-gray-800">Complexity Analysis</h3>
        </div>
        <div className="space-y-2">
          {analysis.complexityAnalysis.map((complexity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700">{complexity}</span>
            </div>
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
          <Lightbulb className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Migration Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
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