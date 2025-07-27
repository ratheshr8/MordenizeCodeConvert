import React, { useState } from 'react';
import { Copy, Download, CheckCircle, Rocket, AlertTriangle, Settings, Zap, FileText, Package, Code, Database, Globe } from 'lucide-react';
import { BusinessLogicGenerationResult } from '../../types/businessLogic';

interface BusinessLogicGenerationResultsProps {
  result: BusinessLogicGenerationResult;
}

export const BusinessLogicGenerationResults: React.FC<BusinessLogicGenerationResultsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'deployment' | 'files'>('overview');
  const [copied, setCopied] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleCopy = () => {
    let contentToCopy = '';
    switch (activeTab) {
      case 'overview':
        contentToCopy = result.description;
        break;
      case 'setup':
        contentToCopy = result.setupInstructions;
        break;
      case 'deployment':
        contentToCopy = result.deploymentGuide;
        break;
      case 'files':
        contentToCopy = result.generatedFiles.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
        break;
    }
    
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    
    try {
      for (const file of result.generatedFiles) {
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

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4 text-blue-500" />;
      case 'config': return <Settings className="h-4 w-4 text-orange-500" />;
      case 'test': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'documentation': return <FileText className="h-4 w-4 text-green-500" />;
      case 'deployment': return <Rocket className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-100 text-blue-800';
      case 'config': return 'bg-orange-100 text-orange-800';
      case 'test': return 'bg-purple-100 text-purple-800';
      case 'documentation': return 'bg-green-100 text-green-800';
      case 'deployment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group files by type
  const groupedFiles = result.generatedFiles.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = [];
    }
    acc[file.type].push(file);
    return acc;
  }, {} as Record<string, typeof result.generatedFiles>);

  return (
    <div className="space-y-6">
      {/* Generation Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Complete Project Generated Successfully</h3>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-2">{result.projectName}</h4>
          <p className="text-gray-600">{result.summary}</p>
        </div>
        
        {/* Generation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{result.filesGenerated}</div>
            <div className="text-sm text-blue-700">Files Generated</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Database className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{result.architecture.length}</div>
            <div className="text-sm text-purple-700">Architecture Patterns</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{result.technologies.length}</div>
            <div className="text-sm text-green-700">Technologies</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
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
            <span>{downloadingAll ? 'Downloading...' : 'Download Complete Project'}</span>
          </button>
        </div>
      </div>

      {/* Architecture & Technologies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture Patterns */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-6 w-6 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-800">Architecture Patterns</h3>
          </div>
          <div className="space-y-2">
            {result.architecture.map((pattern, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                <span className="text-gray-700 text-sm">{pattern}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies Used */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-800">Technologies Used</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Applied Options */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Applied Generation Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.appliedOptions.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-blue-800 text-sm">{option}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-800">Important Notes</h3>
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

      {/* Next Steps */}
      <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Rocket className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-800">Next Steps</h3>
        </div>
        <div className="space-y-3">
          {result.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Content Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'setup'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Setup Instructions
            </button>
            <button
              onClick={() => setActiveTab('deployment')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'deployment'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deployment Guide
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'files'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generated Files ({result.generatedFiles.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'files' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">Generated Project Files</h4>
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>

              {/* File Groups */}
              {Object.entries(groupedFiles).map(([type, files]) => (
                <div key={type}>
                  <h5 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                    {getFileTypeIcon(type)}
                    <span className="ml-2">{type} Files ({files.length})</span>
                  </h5>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            {getFileTypeIcon(file.type)}
                            <span className="font-medium text-gray-800">{file.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>
                              {file.type}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{file.path}</span>
                        </div>
                        <div className="p-4">
                          <pre className="text-sm text-gray-800 overflow-auto max-h-64 bg-gray-50 p-3 rounded">
                            <code>{file.content.replace(/\\n/g, '\n')}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">
                  {activeTab === 'overview' ? 'Project Description' :
                   activeTab === 'setup' ? 'Setup Instructions' :
                   'Deployment Guide'}
                </h4>
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

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-800 overflow-auto max-h-96 whitespace-pre-wrap">
                  {activeTab === 'overview' ? result.description.replace(/\\n/g, '\n') :
                   activeTab === 'setup' ? result.setupInstructions.replace(/\\n/g, '\n') :
                   result.deploymentGuide.replace(/\\n/g, '\n')}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};