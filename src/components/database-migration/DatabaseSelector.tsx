import React from 'react';
import { DatabaseType } from '../../types/database';
import { getDatabasesByCategory, getRecommendedTargets, databases, getConvertibleDatabases } from '../../data/databases';

interface DatabaseSelectorProps {
  selectedDatabase: string | null;
  onDatabaseSelect: (databaseId: string) => void;
  title: string;
  type: 'source' | 'target';
  sourceDatabase?: string | null;
}

export const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  selectedDatabase,
  onDatabaseSelect,
  title,
  type,
  sourceDatabase
}) => {
  let categorizedDatabases = getDatabasesByCategory();
  
  // Filter target databases based on source selection
  if (type === 'target' && sourceDatabase) {
    const convertibleDatabases = getConvertibleDatabases(sourceDatabase);
    const recommendedTargets = getRecommendedTargets(sourceDatabase);
    const filteredDatabases: Record<string, DatabaseType[]> = {};
    
    Object.entries(categorizedDatabases).forEach(([category, dbs]) => {
      const filtered = dbs.filter(db => convertibleDatabases.includes(db.id));
      if (filtered.length > 0) {
        filteredDatabases[category] = filtered;
      }
    });
    
    categorizedDatabases = filteredDatabases;
  }
  
  const borderColor = type === 'source' ? 'border-purple-200' : 'border-brand-orange-200';
  
  const getDatabaseStyle = (database: DatabaseType) => {
    if (type === 'source') {
      return selectedDatabase === database.id
        ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    // For target databases, show different styles for recommended vs other convertible
    if (sourceDatabase) {
      const recommendedTargets = getRecommendedTargets(sourceDatabase);
      const isRecommended = recommendedTargets.includes(database.id);
      
      if (selectedDatabase === database.id) {
        return 'border-brand-blue-500 bg-brand-blue-50 scale-105 shadow-md';
      }
      
      if (isRecommended) {
        return 'border-brand-orange-300 bg-brand-orange-25 hover:border-brand-orange-400 hover:bg-brand-orange-50 ring-2 ring-brand-orange-200';
      }
      
      return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    return selectedDatabase === database.id
      ? 'border-brand-orange-500 bg-brand-orange-50 scale-105 shadow-md'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  // Show message if no target databases available
  if (type === 'target' && sourceDatabase && Object.keys(categorizedDatabases).length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No target databases available</div>
          <div className="text-sm text-gray-400">Please select a source database first</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColor} p-6`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {type === 'target' && sourceDatabase && (
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-brand-orange-50 border border-brand-orange-200 rounded-lg">
            <div className="text-sm text-brand-orange-800">
              <span className="font-medium">All convertible databases for {databases.find(d => d.id === sourceDatabase)?.name}</span>
              <p className="mt-1 text-brand-orange-700">Our AI can convert to any of these databases. Recommended options are highlighted with an orange border.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-brand-orange-300 bg-brand-orange-25 rounded ring-2 ring-brand-orange-200"></div>
              <span className="text-gray-600">Recommended (Best Match)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-200 bg-white rounded"></div>
              <span className="text-gray-600">Other Convertible Databases</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(categorizedDatabases).map(([category, databases]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {databases.map((database: DatabaseType) => (
                <button
                  key={database.id}
                  onClick={() => onDatabaseSelect(database.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group text-left ${getDatabaseStyle(database)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {database.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{database.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{database.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {database.extensions.join(', ')}
                        {type === 'target' && sourceDatabase && getRecommendedTargets(sourceDatabase).includes(database.id) && (
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