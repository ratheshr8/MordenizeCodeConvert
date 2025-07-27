import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { BusinessLogicGenerationOptions as BusinessLogicGenerationOptionsType } from '../../types/businessLogic';
import { getFrameworkById } from '../../data/targetFrameworks';

interface BusinessLogicGenerationOptionsProps {
  options: BusinessLogicGenerationOptionsType;
  onOptionsChange: (options: BusinessLogicGenerationOptionsType) => void;
  targetFramework?: string | null;
}

export const BusinessLogicGenerationOptions: React.FC<BusinessLogicGenerationOptionsProps> = ({
  options,
  onOptionsChange,
  targetFramework
}) => {
  const handleOptionToggle = (key: keyof BusinessLogicGenerationOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'includeDatabase' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include Database',
      description: 'Generate database schema and models',
      icon: '🗄️'
    },
    {
      key: 'includeAPI' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include API',
      description: 'Generate REST API endpoints',
      icon: '🔌'
    },
    {
      key: 'includeFrontend' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include Frontend',
      description: 'Create user interface components',
      icon: '🎨'
    },
    {
      key: 'includeTests' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include Tests',
      description: 'Generate comprehensive test suite',
      icon: '🧪'
    },
    {
      key: 'includeDocumentation' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include Documentation',
      description: 'Create project documentation',
      icon: '📚'
    },
    {
      key: 'includeDeployment' as keyof BusinessLogicGenerationOptionsType,
      title: 'Include Deployment',
      description: 'Add deployment configuration',
      icon: '🚀'
    },
    {
      key: 'addAuthentication' as keyof BusinessLogicGenerationOptionsType,
      title: 'Add Authentication',
      description: 'Implement user authentication',
      icon: '🔐'
    },
    {
      key: 'addLogging' as keyof BusinessLogicGenerationOptionsType,
      title: 'Add Logging',
      description: 'Include logging and monitoring',
      icon: '📊'
    },
    {
      key: 'addErrorHandling' as keyof BusinessLogicGenerationOptionsType,
      title: 'Add Error Handling',
      description: 'Implement comprehensive error handling',
      icon: '⚠️'
    },
    {
      key: 'optimizePerformance' as keyof BusinessLogicGenerationOptionsType,
      title: 'Optimize Performance',
      description: 'Apply performance optimizations',
      icon: '⚡'
    },
    {
      key: 'followBestPractices' as keyof BusinessLogicGenerationOptionsType,
      title: 'Follow Best Practices',
      description: 'Apply framework best practices',
      icon: '✨'
    }
  ];

  const framework = targetFramework ? getFrameworkById(targetFramework) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Project Generation Options</h3>
        
        {/* Framework Display */}
        {framework && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-lg">{framework.icon}</span>
              <span className="font-medium text-blue-800">{framework.name}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {optionsList.map((option) => (
          <div
            key={option.key}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-colors duration-200"
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
                  ? 'bg-green-500 border-green-500 text-white scale-110'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {options[option.key] && <Check size={12} />}
            </button>
          </div>
        ))}
      </div>
      
      {framework && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Framework-specific features will be automatically included:</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {framework.features.map((feature, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};