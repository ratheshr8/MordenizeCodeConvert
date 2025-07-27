import React from 'react';
import { MainPage } from './components/MainPage';
import { ConfigurationGuide } from './components/ConfigurationGuide';
import { CodeQualityWizard } from './components/CodeQualityWizard';

type AppView = 'main' | 'quality';

function App() {
  const [currentView, setCurrentView] = React.useState<AppView>('main');
  
  // Check if Azure OpenAI is configured
  const isConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'quality':
        return <CodeQualityWizard onBackToMain={() => setCurrentView('main')} />;
      case 'main':
      default:
        return <MainPage onNavigateToQuality={() => setCurrentView('quality')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isConfigured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ConfigurationGuide />
        </div>
      )}
      
      {isConfigured ? (
        renderCurrentView()
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Code Migration Platform</h2>
            <p className="text-gray-600">
              Please configure your Azure OpenAI credentials above to get started with AI-powered code conversion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;