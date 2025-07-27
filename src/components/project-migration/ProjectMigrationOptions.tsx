import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { ProjectMigrationOptions as ProjectMigrationOptionsType } from '../../types/projectMigration';
import { projectFrameworks } from '../../data/projectFrameworks';

interface ProjectMigrationOptionsProps {
  options: ProjectMigrationOptionsType;
  onOptionsChange: (options: ProjectMigrationOptionsType) => void;
  sourceFramework?: string | null;
  targetFramework?: string | null;
}

export const ProjectMigrationOptions: React.FC<ProjectMigrationOptionsProps> = ({
  options,
  onOptionsChange,
  sourceFramework,
  targetFramework
}) => {
  const handleOptionToggle = (key: keyof ProjectMigrationOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'preserveArchitecture' as keyof ProjectMigrationOptionsType,
      title: 'Preserve Architecture',
      description: 'Keep existing architectural patterns',
      icon: '🏗️'
    },
    {
      key: 'modernizePatterns' as keyof ProjectMigrationOptionsType,
      title: 'Modernize Patterns',
      description: 'Apply modern design patterns',
      icon: '✨'
    },
    {
      key: 'updateDependencies' as keyof ProjectMigrationOptionsType,
      title: 'Update Dependencies',
      description: 'Upgrade to latest versions',
      icon: '📦'
    },
    {
      key: 'generateTests' as keyof ProjectMigrationOptionsType,
      title: 'Generate Tests',
      description: 'Create comprehensive test suite',
      icon: '🧪'
    },
    {
      key: 'createDocumentation' as keyof ProjectMigrationOptionsType,
      title: 'Create Documentation',
      description: 'Generate project documentation',
      icon: '📚'
    },
    {
      key: 'optimizePerformance' as keyof ProjectMigrationOptionsType,
      title: 'Optimize Performance',
      description: 'Apply performance improvements',
      icon: '⚡'
    },
    {
      key: 'addSecurity' as keyof ProjectMigrationOptionsType,
      title: 'Add Security',
      description: 'Implement security best practices',
      icon: '🔒'
    },
    {
      key: 'includeCI' as keyof ProjectMigrationOptionsType,
      title: 'Include CI/CD',
      description: 'Add CI/CD pipeline configuration',
      icon: '🚀'
    }
  ];

  const getFrameworkName = (frameworkId: string | null) => {
    if (!frameworkId) return null;
    return projectFrameworks.find(framework => framework.id === frameworkId)?.name || frameworkId;
  };

  const getFrameworkIcon = (frameworkId: string | null) => {
    if (!frameworkId) return null;
    return projectFrameworks.find(framework => framework.id === frameworkId)?.icon || '📄';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Migration Options</h3>
        
        {/* Framework Selection Display */}
        {(sourceFramework || targetFramework) && (
          <div className="flex items-center space-x-3 text-sm">
            {sourceFramework && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-lg">{getFrameworkIcon(sourceFramework)}</span>
                <span className="font-medium text-blue-800">{getFrameworkName(sourceFramework)}</span>
              </div>
            )}
            
            {sourceFramework && targetFramework && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
            
            {targetFramework && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-lg">{getFrameworkIcon(targetFramework)}</span>
                <span className="font-medium text-orange-800">{getFrameworkName(targetFramework)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {optionsList.map((option) => (
          <div
            key={option.key}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors duration-200"
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
                  ? 'bg-orange-500 border-orange-500 text-white scale-110'
                  : 'border-gray-300 hover:border-orange-400'
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