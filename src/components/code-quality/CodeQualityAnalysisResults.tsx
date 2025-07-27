import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Info, Lightbulb, Clock, Shield, Zap } from 'lucide-react';
import { CodeQualityAnalysisResult, CodeQualityIssue } from '../../types/codeQuality';

interface CodeQualityAnalysisResultsProps {
  analysis: CodeQualityAnalysisResult;
  loading: boolean;
}

export const CodeQualityAnalysisResults: React.FC<CodeQualityAnalysisResultsProps> = ({
  analysis,
  loading
}) => {
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [activeIssueFilter, setActiveIssueFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

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
            {chunkProgress ? 'Processing large codebase in chunks...' : 'Analyzing code quality with Azure GPT-4...'}
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
                Large codebases are processed in smaller chunks for better performance
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'maintainability': return <BarChart3 className="h-4 w-4" />;
      case 'reliability': return <CheckCircle className="h-4 w-4" />;
      case 'style': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredIssues = activeIssueFilter === 'all' 
    ? analysis.issues 
    : analysis.issues.filter(issue => issue.severity === activeIssueFilter);

  const issueCountsBySeverity = analysis.issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Code Quality Score</h3>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getGradeColor(analysis.grade)}`}>
            Grade {analysis.grade}
          </div>
        </div>
        
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Score</span>
              <span>{analysis.overallScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  analysis.overallScore >= 80 ? 'bg-green-500' :
                  analysis.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600">{analysis.summary}</p>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Quality Metrics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.metrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 text-sm">{metric.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getMetricStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-bold text-gray-800">{metric.value}</span>
                <span className="text-sm text-gray-500">/ {metric.maxValue}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-500' :
                    metric.status === 'good' ? 'bg-blue-500' :
                    metric.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-800">Issues Found ({analysis.issues.length})</h3>
          </div>
          
          {/* Issue Filter */}
          <div className="flex space-x-2">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => setActiveIssueFilter(severity)}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                  activeIssueFilter === severity
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                {severity !== 'all' && ` (${issueCountsBySeverity[severity] || 0})`}
              </button>
            ))}
          </div>
        </div>
        
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No issues found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIssueIcon(issue.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-800">{issue.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-500">
                        {getCategoryIcon(issue.category)}
                        <span className="text-xs">{issue.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>📁 {issue.file}</span>
                      {issue.line && <span>📍 Line {issue.line}</span>}
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lightbulb className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-gray-700">Suggestion:</span>
                      </div>
                      <p className="text-xs text-gray-600">{issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Debt */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-800">Technical Debt</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-3">Priority Items</h4>
            <div className="space-y-2">
              {analysis.technicalDebt.priority.slice(0, 3).map((item, index) => (
                <div key={index} className="text-sm text-orange-700 flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">Categories</h4>
            <div className="space-y-2">
              {Object.entries(analysis.technicalDebt.categories).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-blue-700 capitalize">{category}</span>
                  <span className="font-medium text-blue-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Smells, Security, Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Smells */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">Code Smells</h3>
          </div>
          <div className="space-y-2">
            {analysis.codeSmells.map((smell, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-yellow-800">{smell}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Vulnerabilities */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Security Issues</h3>
          </div>
          <div className="space-y-2">
            {analysis.securityVulnerabilities.map((vulnerability, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-red-800">{vulnerability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Issues */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Performance Issues</h3>
          </div>
          <div className="space-y-2">
            {analysis.performanceIssues.map((issue, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-blue-800">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};