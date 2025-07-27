import React from 'react';
import { Check } from 'lucide-react';
import { CodeQualityOptions as CodeQualityOptionsType } from '../../types/codeQuality';

interface CodeQualityOptionsProps {
  options: CodeQualityOptionsType;
  onOptionsChange: (options: CodeQualityOptionsType) => void;
}

export const CodeQualityOptions: React.FC<CodeQualityOptionsProps> = ({
  options,
  onOptionsChange
}) => {
  const handleOptionToggle = (key: keyof CodeQualityOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'checkPerformance' as keyof CodeQualityOptionsType,
      title: 'Performance Analysis',
      description: 'Identify performance bottlenecks',
      icon: '⚡'
    },
    {
      key: 'checkSecurity' as keyof CodeQualityOptionsType,
      title: 'Security Analysis',
      description: 'Detect security vulnerabilities',
      icon: '🔒'
    },
    {
      key: 'checkMaintainability' as keyof CodeQualityOptionsType,
      title: 'Maintainability Check',
      description: 'Assess code maintainability',
      icon: '🔧'
    },
    {
      key: 'checkReliability' as keyof CodeQualityOptionsType,
      title: 'Reliability Analysis',
      description: 'Check error handling and reliability',
      icon: '🛡️'
    },
    {
      key: 'checkStyle' as keyof CodeQualityOptionsType,
      title: 'Style & Conventions',
      description: 'Verify coding standards',
      icon: '📝'
    },
    {
      key: 'includeMetrics' as keyof CodeQualityOptionsType,
      title: 'Include Metrics',
      description: 'Generate detailed metrics',
      icon: '📊'
    },
    {
      key: 'generateReport' as keyof CodeQualityOptionsType,
      title: 'Generate Report',
      description: 'Create comprehensive report',
      icon: '📋'
    },
    {
      key: 'suggestRefactoring' as keyof CodeQualityOptionsType,
      title: 'Refactoring Suggestions',
      description: 'Provide improvement suggestions',
      icon: '💡'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Analysis Options</h3>
        <div className="text-sm text-gray-600">
          Configure what aspects of code quality to analyze
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {optionsList.map((option) => (
          <div
            key={option.key}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
          >
            <div className="text-xl">{option.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-sm">{option.title}</h4>
              <p className="text-xs text-gray-600">{option.description}</p>
            </div>
            <button
              onClick={() => handleOptionToggle(option.key)}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200 ${
                options[option.key]
                  ? 'bg-blue-500 border-blue-500 text-white scale-110'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {options[option.key] && <Check size={12} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};