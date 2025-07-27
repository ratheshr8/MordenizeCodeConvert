import React, { useState } from 'react';
import { Settings, Key, Globe, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export const ConfigurationGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEnv = () => {
    const envContent = `# Azure OpenAI Configuration
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview`;

    navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-brand-orange-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-brand-orange-500" />
        <h3 className="text-xl font-semibold text-gray-800">Azure OpenAI Configuration Required</h3>
      </div>

      <div className="space-y-6">
        <div className="bg-brand-orange-50 border border-brand-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-brand-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-brand-orange-800 mb-1">Setup Required</h4>
              <p className="text-brand-orange-700 text-sm">
                To use this application, you need to configure Azure OpenAI credentials. Follow the steps below to get started.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-brand-blue-100 text-brand-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Create Azure OpenAI Resource</h4>
              <p className="text-gray-600 text-sm mb-2">
                Go to the Azure Portal and create an Azure OpenAI resource in your subscription.
              </p>
              <a
                href="https://portal.azure.com/#create/Microsoft.CognitiveServicesOpenAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-brand-blue-600 hover:text-brand-blue-700 text-sm"
              >
                <Globe className="h-4 w-4" />
                <span>Create Azure OpenAI Resource</span>
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-brand-blue-100 text-brand-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Deploy GPT-4 Model</h4>
              <p className="text-gray-600 text-sm">
                In Azure OpenAI Studio, deploy a GPT-4 model and note the deployment name.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-brand-blue-100 text-brand-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Get API Credentials</h4>
              <p className="text-gray-600 text-sm mb-2">
                From your Azure OpenAI resource, copy the endpoint URL and API key.
              </p>
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Keys and Endpoint section in Azure Portal</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-brand-blue-100 text-brand-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Configure Environment Variables</h4>
              <p className="text-gray-600 text-sm mb-3">
                Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in your project root with the following variables:
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Environment Variables</span>
                  <button
                    onClick={handleCopyEnv}
                    className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs text-gray-800 overflow-x-auto">
{`# Azure OpenAI Configuration
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-1">Ready to Use</h4>
              <p className="text-green-700 text-sm">
                Once configured, restart the development server and the application will connect to Azure OpenAI GPT-4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};