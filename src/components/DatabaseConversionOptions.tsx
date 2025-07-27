import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { DatabaseConversionOptions as DatabaseConversionOptionsType } from '../types/database';
import { databases } from '../data/databases';

interface DatabaseConversionOptionsProps {
  options: DatabaseConversionOptionsType;
  onOptionsChange: (options: DatabaseConversionOptionsType) => void;
  sourceDatabase?: string | null;
  targetDatabase?: string | null;
}

export const DatabaseConversionOptions: React.FC<DatabaseConversionOptionsProps> = ({
  options,
  onOptionsChange,
  sourceDatabase,
  targetDatabase
}) => {
  const handleOptionToggle = (key: keyof DatabaseConversionOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'preserveConstraints' as keyof DatabaseConversionOptionsType,
      title: 'Preserve Constraints',
      description: 'Keep foreign keys and constraints',
      icon: '🔗'
    },
    {
      key: 'generateIndexes' as keyof DatabaseConversionOptionsType,
      title: 'Generate Indexes',
      description: 'Create optimized indexes',
      icon: '⚡'
    },
    {
      key: 'optimizeQueries' as keyof DatabaseConversionOptionsType,
      title: 'Optimize Queries',
      description: 'Apply database-specific optimizations',
      icon: '🚀'
    },
    {
      key: 'includeTestData' as keyof DatabaseConversionOptionsType,
      title: 'Include Test Data',
      description: 'Generate sample data',
      icon: '📊'
    },
    {
      key: 'generateMigrationScripts' as keyof DatabaseConversionOptionsType,
      title: 'Migration Scripts',
      description: 'Create step-by-step migration',
      icon: '📋'
    }
  ];

  const getDatabaseName = (databaseId: string | null) => {
    if (!databaseId) return null;
    return databases.find(db => db.id === databaseId)?.name || databaseId;
  };

  const getDatabaseIcon = (databaseId: string | null) => {
    if (!databaseId) return null;
    return databases.find(db => db.id === databaseId)?.icon || '🗄️';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Conversion Options</h3>
        
        {/* Database Selection Display */}
        {(sourceDatabase || targetDatabase) && (
          <div className="flex items-center space-x-3 text-sm">
            {sourceDatabase && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-lg">{getDatabaseIcon(sourceDatabase)}</span>
                <span className="font-medium text-purple-800">{getDatabaseName(sourceDatabase)}</span>
              </div>
            )}
            
            {sourceDatabase && targetDatabase && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
            
            {targetDatabase && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-brand-orange-50 border border-brand-orange-200 rounded-lg">
                <span className="text-lg">{getDatabaseIcon(targetDatabase)}</span>
                <span className="font-medium text-brand-orange-800">{getDatabaseName(targetDatabase)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {optionsList.map((option) => (
          <div
            key={option.key}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200"
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
                  ? 'bg-purple-500 border-purple-500 text-white scale-110'
                  : 'border-gray-300 hover:border-purple-400'
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