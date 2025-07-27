import React from 'react';
import { Brain, Code, Workflow, Lightbulb } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  loading: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg text-gray-600">Analyzing code with AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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