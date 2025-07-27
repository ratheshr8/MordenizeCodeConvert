import React from 'react';
import { TargetFramework } from '../../types/businessLogic';
import { getFrameworksByCategory, getRecommendedFrameworks, targetFrameworks } from '../../data/targetFrameworks';

interface TargetFrameworkSelectorProps {
  selectedFramework: string | null;
  onFrameworkSelect: (frameworkId: string) => void;
  businessLogicType?: string;
}

export const TargetFrameworkSelector: React.FC<TargetFrameworkSelectorProps> = ({
  selectedFramework,
  onFrameworkSelect,
  businessLogicType = 'default'
}) => {
  const categorizedFrameworks = getFrameworksByCategory();
  const recommendedFrameworks = getRecommendedFrameworks(businessLogicType);
  
  const getFrameworkStyle = (framework: TargetFramework) => {
    const isSelected = selectedFramework === framework.id;
    const isRecommended = recommendedFrameworks.includes(framework.id);
    
    if (isSelected) {
      return 'border-blue-500 bg-blue-50 scale-105 shadow-md';
    }
    
    if (isRecommended) {
      return 'border-blue-300 bg-blue-25 hover:border-blue-400 hover:bg-blue-50 ring-2 ring-blue-200';
    }
    
    return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Select Target Framework</h3>
      
      <div className="mb-6 space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Choose the framework for your new application</span>
            <p className="mt-1 text-blue-700">Recommended frameworks are highlighted with a blue border based on your business logic.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-300 bg-blue-25 rounded ring-2 ring-blue-200"></div>
            <span className="text-gray-600">Recommended (Best Match)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border border-gray-200 bg-white rounded"></div>
            <span className="text-gray-600">Other Available Frameworks</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.entries(categorizedFrameworks).map(([category, frameworks]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {frameworks.map((framework: TargetFramework) => (
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
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="font-medium text-gray-800 text-lg">{framework.name}</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(framework.complexity)}`}>
                          {framework.complexity}
                        </span>
                        {recommendedFrameworks.includes(framework.id) && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{framework.description}</div>
                      
                      {/* Technologies */}
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">Technologies:</div>
                        <div className="flex flex-wrap gap-1">
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
                      </div>
                      
                      {/* Features */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {framework.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                          {framework.features.length > 3 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              +{framework.features.length - 3} more
                            </span>
                          )}
                        </div>
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