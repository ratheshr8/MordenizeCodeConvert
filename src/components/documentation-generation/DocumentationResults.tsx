import React, { useState } from 'react';
import { Copy, Download, CheckCircle, FileText, Settings, Zap, Package, BookOpen } from 'lucide-react';
import { DocumentationResult } from '../../types/documentation';

interface DocumentationResultsProps {
  result: DocumentationResult;
}

export const DocumentationResults: React.FC<DocumentationResultsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'documentation' | 'original'>('documentation');
  const [copied, setCopied] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleCopy = () => {
    const contentToCopy = activeTab === 'documentation' ? result.generatedDocumentation : result.originalCode;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    
    try {
      for (const file of result.documentationFiles) {
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
      {/* Documentation Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Documentation Generation Complete</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{result.summary}</p>
        
        {/* Documentation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{result.filesGenerated}</div>
            <div className="text-sm text-green-700">Files Generated</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{result.sections.length}</div>
            <div className="text-sm text-blue-700">Sections</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{result.features.length}</div>
            <div className="text-sm text-purple-700">Features</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Settings className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{result.warnings.length}</div>
            <div className="text-sm text-orange-700">Warnings</div>
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
            <span>{downloadingAll ? 'Downloading...' : 'Download All Documentation'}</span>
          </button>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Documentation Sections</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.sections.map((section, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-blue-800 text-sm">{section}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Documented */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Features Documented</h3>
        </div>
        <div className="space-y-2">
          {result.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
              <span className="text-purple-800 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Applied Documentation Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.appliedSettings.map((setting, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-green-800 text-sm">{setting}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-6 w-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-800">Important Notes</h3>
          </div>
          <div className="space-y-3">
            {result.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Settings className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-800">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('documentation')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'documentation'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generated Documentation
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'original'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Original Code Summary
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              {activeTab === 'documentation' ? 'Generated Documentation' : 'Original Code Summary'}
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
            <pre className="text-sm text-gray-800 overflow-auto max-h-96 whitespace-pre-wrap">
              {activeTab === 'documentation' 
                ? result.generatedDocumentation.replace(/\\n/g, '\n')
                : result.originalCode.replace(/\\n/g, '\n')
              }
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};