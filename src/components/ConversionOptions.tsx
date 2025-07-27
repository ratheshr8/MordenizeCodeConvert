import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { ConversionOptions as ConversionOptionsType } from '../types';
import { languages } from '../data/languages';

interface ConversionOptionsProps {
  options: ConversionOptionsType;
  onOptionsChange: (options: ConversionOptionsType) => void;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  options,
  onOptionsChange,
  sourceLanguage,
  targetLanguage
}) => {
  const handleOptionToggle = (key: keyof ConversionOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'preserveComments' as keyof ConversionOptionsType,
      title: 'Preserve Comments',
      description: 'Keep original code comments',
      icon: '💬'
    },
    {
      key: 'generateDocs' as keyof ConversionOptionsType,
      title: 'Generate Documentation',
      description: 'Create comprehensive documentation',
      icon: '📚'
    },
    {
      key: 'optimizeCode' as keyof ConversionOptionsType,
      title: 'Optimize Code',
      description: 'Apply modern best practices',
      icon: '⚡'
    },
    {
      key: 'includeTests' as keyof ConversionOptionsType,
      title: 'Include Tests',
      description: 'Generate unit tests',
      icon: '🧪'
    }
  ];

  const getLanguageName = (languageId: string | null) => {
    if (!languageId) return null;
    return languages.find(lang => lang.id === languageId)?.name || languageId;
  };

  const getLanguageIcon = (languageId: string | null) => {
    if (!languageId) return null;
    return languages.find(lang => lang.id === languageId)?.icon || '📄';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-brand-orange-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Conversion Options</h3>
        
        {/* Language Selection Display */}
        {(sourceLanguage || targetLanguage) && (
          <div className="flex items-center space-x-3 text-sm">
            {sourceLanguage && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                <span className="text-lg">{getLanguageIcon(sourceLanguage)}</span>
                <span className="font-medium text-brand-blue-800">{getLanguageName(sourceLanguage)}</span>
              </div>
            )}
            
            {sourceLanguage && targetLanguage && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
            
            {targetLanguage && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-brand-orange-50 border border-brand-orange-200 rounded-lg">
                <span className="text-lg">{getLanguageIcon(targetLanguage)}</span>
                <span className="font-medium text-brand-orange-800">{getLanguageName(targetLanguage)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {optionsList.map((option) => (
          <div
            key={option.key}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-brand-orange-300 transition-colors duration-200"
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
                  ? 'bg-brand-orange-500 border-brand-orange-500 text-white scale-110'
                  : 'border-gray-300 hover:border-brand-orange-400'
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