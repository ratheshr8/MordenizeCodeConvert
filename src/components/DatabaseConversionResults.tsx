import React, { useState } from 'react';
import { Copy, Download, CheckCircle, Database, AlertTriangle, Settings, Zap, FileText, Package } from 'lucide-react';
import { DatabaseConversionResult } from '../types/database';

interface DatabaseConversionResultsProps {
  result: DatabaseConversionResult;
}

export const DatabaseConversionResults: React.FC<DatabaseConversionResultsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'queries' | 'original-schema' | 'original-queries'>('schema');
  const [copied, setCopied] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleCopy = () => {
    let contentToCopy = '';
    switch (activeTab) {
      case 'schema':
        contentToCopy = result.convertedSchema;
        break;
      case 'queries':
        contentToCopy = result.convertedQueries;
        break;
      case 'original-schema':
        contentToCopy = result.originalSchema;
        break;
      case 'original-queries':
        contentToCopy = result.originalQueries;
        break;
    }
    
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    
    try {
      for (const file of result.convertedFiles) {
        const processedContent = file.content.replace(/\\n/g, '\n');
        const blob = new Blob([processedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Conversion Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Database Conversion Complete</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{result.summary}</p>
        
        {/* Conversion Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Database className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{result.filesGenerated}</div>
            <div className="text-sm text-purple-700">Files Generated</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{result.warnings.length}</div>
            <div className="text-sm text-orange-700">Warnings</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{result.optimizations.length}</div>
            <div className="text-sm text-blue-700">Optimizations</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{result.migrationScripts.length}</div>
            <div className="text-sm text-green-700">Migration Scripts</div>
          </div>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              downloadingAll
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>{downloadingAll ? 'Downloading...' : 'Download All Files'}</span>
          </button>
        </div>
      </div>

      {/* Important Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-800">Important Warnings</h3>
          </div>
          <div className="space-y-3">
            {result.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-800">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applied Conversion Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Applied Conversion Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.appliedSettings.map((setting, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span className="text-purple-800 text-sm">{setting}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimizations Applied */}
      {result.optimizations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Optimizations Applied</h3>
          </div>
          <div className="space-y-2">
            {result.optimizations.map((optimization, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <span className="text-blue-800 text-sm">{optimization}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Scripts */}
      {result.migrationScripts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-800">Migration Scripts Generated</h3>
          </div>
          <div className="space-y-2">
            {result.migrationScripts.map((script, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <FileText className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-green-800 text-sm">{script}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Changes Made */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-700 mb-4">Key Changes Made:</h4>
        <div className="space-y-2">
          {result.changes.map((change, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 text-sm">{change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Content Comparison */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'schema'
                  ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Converted Schema
            </button>
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'queries'
                  ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Converted Queries
            </button>
            <button
              onClick={() => setActiveTab('original-schema')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'original-schema'
                  ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Original Schema
            </button>
            <button
              onClick={() => setActiveTab('original-queries')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'original-queries'
                  ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Original Queries
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              {activeTab === 'schema' ? 'Converted Schema' :
               activeTab === 'queries' ? 'Converted Queries' :
               activeTab === 'original-schema' ? 'Original Schema' :
               'Original Queries'}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="text-sm text-gray-800 overflow-auto max-h-96">
              <code>
                {activeTab === 'schema' ? result.convertedSchema.replace(/\\n/g, '\n') :
                 activeTab === 'queries' ? result.convertedQueries.replace(/\\n/g, '\n') :
                 activeTab === 'original-schema' ? result.originalSchema.replace(/\\n/g, '\n') :
                 result.originalQueries.replace(/\\n/g, '\n')}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};