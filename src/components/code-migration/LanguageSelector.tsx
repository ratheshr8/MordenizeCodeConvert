import React from 'react';
import { Language } from '../../types';
import { getLanguagesByCategory, getRecommendedTargets, languages, getConvertibleLanguages } from '../../data/languages';

interface LanguageSelectorProps {
  selectedLanguage: string | null;
  onLanguageSelect: (languageId: string) => void;
  title: string;
  type: 'source' | 'target';
  sourceLanguage?: string | null;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect,
  title,
  type,
  sourceLanguage
}) => {
  let categorizedLanguages = getLanguagesByCategory();
  
  // Filter target languages based on source selection
  if (type === 'target' && sourceLanguage) {
    const convertibleLanguages = getConvertibleLanguages(sourceLanguage);
    const recommendedTargets = getRecommendedTargets(sourceLanguage);
    const filteredLanguages: Record<string, Language[]> = {};
    
    Object.entries(categorizedLanguages).forEach(([category, langs]) => {
      const filtered = langs.filter(lang => convertibleLanguages.includes(lang.id));
      if (filtered.length > 0) {
        filteredLanguages[category] = filtered;
      }
    });
    
    categorizedLanguages = filteredLanguages;
  }
  
  
  const borderColor = type === 'source' ? 'border-brand-blue-200' : 'border-brand-orange-200';
  
  const getLanguageStyle = (language: Language) => {
    if (type === 'source') {
      return selectedLanguage === language.id
        ? 'border-brand-blue-500 bg-brand-blue-50 scale-105 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    // For target languages, show different styles for recommended vs other convertible
    if (sourceLanguage) {
      const recommendedTargets = getRecommendedTargets(sourceLanguage);
      const isRecommended = recommendedTargets.includes(language.id);
      
      if (selectedLanguage === language.id) {
        return 'border-brand-blue-500 bg-brand-blue-50 scale-105 shadow-md';
      }
      
      if (isRecommended) {
        return 'border-brand-orange-300 bg-brand-orange-25 hover:border-brand-orange-400 hover:bg-brand-orange-50 ring-2 ring-brand-orange-200';
      }
      
      return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    return selectedLanguage === language.id
      ? 'border-brand-blue-500 bg-brand-orange-50 scale-105 shadow-md'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  // Show message if no target languages available
  if (type === 'target' && sourceLanguage && Object.keys(categorizedLanguages).length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No target languages available</div>
          <div className="text-sm text-gray-400">Please select a source language first</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {type === 'target' && sourceLanguage && (
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-brand-orange-50 border border-brand-orange-200 rounded-lg">
            <div className="text-sm text-brand-orange-800">
              <span className="font-medium">All convertible languages for {languages.find(l => l.id === sourceLanguage)?.name}</span>
              <p className="mt-1 text-brand-orange-700">Our AI can convert to any of these languages. Recommended options are highlighted with an orange border.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-brand-orange-300 bg-brand-orange-25 rounded ring-2 ring-brand-orange-200"></div>
              <span className="text-gray-600">Recommended (Best Match)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-200 bg-white rounded"></div>
              <span className="text-gray-600">Other Convertible Languages</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(categorizedLanguages).map(([category, languages]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((language: Language) => (
                <button
                  key={language.id}
                  onClick={() => onLanguageSelect(language.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${getLanguageStyle(language)}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {language.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 text-sm">{language.name}</div>
                      <div className="text-xs text-gray-500">
                        {language.extensions.join(', ')}
                        {type === 'target' && sourceLanguage && getRecommendedTargets(sourceLanguage).includes(language.id) && (
                          <span className="ml-2 text-brand-orange-600 font-medium">★ Recommended</span>
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