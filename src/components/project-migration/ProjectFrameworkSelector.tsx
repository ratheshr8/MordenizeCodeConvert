import React from 'react';
import { ProjectFramework } from '../../types/projectMigration';
import { getFrameworksByCategory, getRecommendedTargets, projectFrameworks, getConvertibleFrameworks } from '../../data/projectFrameworks';

interface ProjectFrameworkSelectorProps {
  selectedFramework: string | null;
  onFrameworkSelect: (frameworkId: string) => void;
  title: string;
  type: 'source' | 'target';
  sourceFramework?: string | null;
}

export const ProjectFrameworkSelector: React.FC<ProjectFrameworkSelectorProps> = ({
  selectedFramework,
  onFrameworkSelect,
  title,
  type,
  sourceFramework
}) => {
  let categorizedFrameworks = getFrameworksByCategory();
  
  // Filter target frameworks based on source selection
  if (type === 'target' && sourceFramework) {
    const convertibleFrameworks = getConvertibleFrameworks(sourceFramework);
    const recommendedTargets = getRecommendedTargets(sourceFramework);
    const filteredFrameworks: Record<string, ProjectFramework[]> = {};
    
    Object.entries(categorizedFrameworks).forEach(([category, frameworks]) => {
      const filtered = frameworks.filter(framework => convertibleFrameworks.includes(framework.id));
      if (filtered.length > 0) {
        filteredFrameworks[category] = filtered;
      }
    });
    
    categorizedFrameworks = filteredFrameworks;
  }
  
  const borderColor = type === 'source' ? 'border-blue-200' : 'border-orange-200';
  
  const getFrameworkStyle = (framework: ProjectFramework) => {
    if (type === 'source') {
      return selectedFramework === framework.id
        ? 'border-blue-500 bg-blue-50 scale-105 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    // For target frameworks, show different styles for recommended vs other convertible
    if (sourceFramework) {
      const recommendedTargets = getRecommendedTargets(sourceFramework);
      const isRecommended = recommendedTargets.includes(framework.id);
      
      if (selectedFramework === framework.id) {
        return 'border-blue-500 bg-blue-50 scale-105 shadow-md';
      }
      
      if (isRecommended) {
        return 'border-orange-300 bg-orange-25 hover:border-orange-400 hover:bg-orange-50 ring-2 ring-orange-200';
      }
      
      return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    return selectedFramework === framework.id
      ? 'border-orange-500 bg-orange-50 scale-105 shadow-md'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  // Show message if no target frameworks available
  if (type === 'target' && sourceFramework && Object.keys(categorizedFrameworks).length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No target frameworks available</div>
          <div className="text-sm text-gray-400">Please select a source framework first</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {type === 'target' && sourceFramework && (
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm text-orange-800">
              <span className="font-medium">All convertible frameworks for {projectFrameworks.find(f => f.id === sourceFramework)?.name}</span>
              <p className="mt-1 text-orange-700">Our AI can migrate to any of these frameworks. Recommended options are highlighted with an orange border.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-300 bg-orange-25 rounded ring-2 ring-orange-200"></div>
              <span className="text-gray-600">Recommended (Best Match)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-200 bg-white rounded"></div>
              <span className="text-gray-600">Other Convertible Frameworks</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(categorizedFrameworks).map(([category, frameworks]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {frameworks.map((framework: ProjectFramework) => (
                <button
                  key={framework.id}
                  onClick={() => onFrameworkSelect(framework.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group text-left ${getFrameworkStyle(framework)}`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {framework.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-lg mb-1">{framework.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{framework.description}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {framework.technologies.slice(0, 4).map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                        {framework.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{framework.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Files: {framework.filePatterns.slice(0, 3).join(', ')}
                        {framework.filePatterns.length > 3 && '...'}
                        {type === 'target' && sourceFramework && getRecommendedTargets(sourceFramework).includes(framework.id) && (
                          <span className="ml-2 text-orange-600 font-medium">★ Recommended</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};