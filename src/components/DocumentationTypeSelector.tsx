import React from 'react';
import { DocumentationType } from '../types/documentation';
import { getDocumentationTypesByCategory, getRecommendedDocumentationTypes, documentationTypes } from '../data/documentationTypes';

interface DocumentationTypeSelectorProps {
  selectedType: string | null;
  onTypeSelect: (typeId: string) => void;
  title: string;
  codeLanguage?: string | null;
}

export const DocumentationTypeSelector: React.FC<DocumentationTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  title,
  codeLanguage
}) => {
  const categorizedTypes = getDocumentationTypesByCategory();
  
  const getTypeStyle = (type: DocumentationType) => {
    const isSelected = selectedType === type.id;
    const isRecommended = codeLanguage && getRecommendedDocumentationTypes(codeLanguage).includes(type.id);
    
    if (isSelected) {
      return 'border-green-500 bg-green-50 scale-105 shadow-md';
    }
    
    if (isRecommended) {
      return 'border-green-300 bg-green-25 hover:border-green-400 hover:bg-green-50 ring-2 ring-green-200';
    }
    
    return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {codeLanguage && (
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <span className="font-medium">Documentation recommendations for {codeLanguage}</span>
              <p className="mt-1 text-green-700">Recommended documentation types are highlighted with a green border.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-300 bg-green-25 rounded ring-2 ring-green-200"></div>
              <span className="text-gray-600">Recommended (Best Match)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-200 bg-white rounded"></div>
              <span className="text-gray-600">Other Documentation Types</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(categorizedTypes).map(([category, types]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((type: DocumentationType) => (
                <button
                  key={type.id}
                  onClick={() => onTypeSelect(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group text-left ${getTypeStyle(type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {type.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{type.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {type.extensions.join(', ')}
                        {codeLanguage && getRecommendedDocumentationTypes(codeLanguage).includes(type.id) && (
                          <span className="ml-2 text-green-600 font-medium">★ Recommended</span>
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