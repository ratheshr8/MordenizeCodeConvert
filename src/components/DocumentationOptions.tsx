import React from 'react';
import { Check } from 'lucide-react';
import { DocumentationOptions as DocumentationOptionsType } from '../types/documentation';
import { documentationTypes } from '../data/documentationTypes';

interface DocumentationOptionsProps {
  options: DocumentationOptionsType;
  onOptionsChange: (options: DocumentationOptionsType) => void;
  documentationType?: string | null;
}

export const DocumentationOptions: React.FC<DocumentationOptionsProps> = ({
  options,
  onOptionsChange,
  documentationType
}) => {
  const handleOptionToggle = (key: keyof DocumentationOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'includeCodeExamples' as keyof DocumentationOptionsType,
      title: 'Include Code Examples',
      description: 'Add practical code snippets',
      icon: '💻'
    },
    {
      key: 'generateDiagrams' as keyof DocumentationOptionsType,
      title: 'Generate Diagrams',
      description: 'Create architecture diagrams',
      icon: '📊'
    },
    {
      key: 'includeAPIReference' as keyof DocumentationOptionsType,
      title: 'API Reference',
      description: 'Comprehensive API documentation',
      icon: '🔌'
    },
    {
      key: 'addInstallationGuide' as keyof DocumentationOptionsType,
      title: 'Installation Guide',
      description: 'Step-by-step setup instructions',
      icon: '⚙️'
    },
    {
      key: 'generateTOC' as keyof DocumentationOptionsType,
      title: 'Table of Contents',
      description: 'Generate navigation structure',
      icon: '📑'
    },
    {
      key: 'includeChangelog' as keyof DocumentationOptionsType,
      title: 'Include Changelog',
      description: 'Version history and updates',
      icon: '📝'
    }
  ];

  const getDocumentationTypeName = (typeId: string | null) => {
    if (!typeId) return null;
    return documentationTypes.find(type => type.id === typeId)?.name || typeId;
  };

  const getDocumentationTypeIcon = (typeId: string | null) => {
    if (!typeId) return null;
    return documentationTypes.find(type => type.id === typeId)?.icon || '📄';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Documentation Options</h3>
        
        {/* Documentation Type Display */}
        {documentationType && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-lg">{getDocumentationTypeIcon(documentationType)}</span>
              <span className="font-medium text-green-800">{getDocumentationTypeName(documentationType)}</span>
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
    </div>
  );
};