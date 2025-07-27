import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { chatbotAIService } from '../services/chatbotAI';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const ChatbotAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m here to help you navigate the Code Migration Platform. Ask me about any feature or how to use the application!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [useAI, setUseAI] = useState(true);

  // Check if Azure OpenAI is configured
  const isAIConfigured = !!(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
    import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStaticResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Code Language Converter
    if (message.includes('code') && (message.includes('convert') || message.includes('migration') || message.includes('language'))) {
      return 'The **Code Language Converter** helps you convert legacy code to modern languages:\n\n1. Select your source language (like COBOL, Fortran) and target language (like Python, Java)\n2. Configure conversion options (preserve comments, generate docs, etc.)\n3. Upload your code files\n4. AI analyzes your code and generates a workflow\n5. Get converted code with documentation and tests\n\nClick on "Code Language Converter" from the main page to get started!';
    }
    
    // Specific language conversion questions
    if ((message.includes('cobol') && message.includes('python')) || 
        (message.includes('convert') && (message.includes('cobol') || message.includes('fortran') || message.includes('legacy')))) {
      return 'To **convert COBOL to Python** (or any legacy language):\n\n**Step-by-Step Process:**\n1. Click "Code Language Converter" from the main page\n2. **Select Source Language**: Choose COBOL from the Legacy category\n3. **Select Target Language**: Choose Python from the Modern category\n4. **Configure Options**: Enable "Preserve Comments", "Generate Documentation", "Optimize Code"\n5. **Upload Files**: Drop your .cob or .cbl COBOL files\n6. **AI Analysis**: GPT-4 analyzes your COBOL code structure\n7. **Generate Workflow**: View the conversion workflow and flow chart\n8. **Get Results**: Download converted Python code with tests and documentation\n\n**What You Get:**\n• Clean, modern Python code\n• Comprehensive documentation\n• Unit tests\n• Migration notes and warnings\n\nThe AI understands COBOL business logic and converts it to Pythonic patterns!';
    }
    
    // Database Migration
    if (message.includes('database') || message.includes('sql') || message.includes('schema')) {
      return 'The **Database Schema & Query Converter** helps migrate between database systems:\n\n1. Select source database (Oracle, SQL Server) and target (PostgreSQL, MySQL)\n2. Configure conversion options (preserve constraints, generate indexes)\n3. Upload SQL files, schemas, or queries\n4. AI analyzes your database structure\n5. Get converted schemas and optimized queries\n\nPerfect for migrating from legacy databases to modern cloud databases!';
    }
    
    // Documentation Generation
    if (message.includes('documentation') || message.includes('docs') || message.includes('readme')) {
      return 'The **Code Documentation Generator** creates comprehensive documentation:\n\n1. Select documentation type (README, API docs, user guide)\n2. Configure options (include examples, diagrams, API reference)\n3. Upload your code files or entire project\n4. AI analyzes code structure and components\n5. Get professional documentation ready for use\n\nGreat for creating missing documentation for existing projects!';
    }
    
    // Code Quality Analysis
    if (message.includes('quality') || message.includes('analysis') || message.includes('metrics')) {
      return 'The **Code Quality Analysis** provides detailed code assessment:\n\n1. Configure analysis options (performance, security, maintainability)\n2. Upload code files or entire codebase\n3. AI analyzes code quality with detailed metrics\n4. Get quality score, issues, and improvement suggestions\n\nHelps identify technical debt and improvement opportunities!';
    }
    
    // Business Logic Extractor
    if (message.includes('business logic') || message.includes('extract') || message.includes('generate project')) {
      return 'The **Business Logic Extractor & Project Generator** is our most powerful feature:\n\n1. Upload your complete existing project\n2. AI extracts core business logic and rules\n3. Edit and refine the extracted business logic\n4. Select target framework (React, Vue, Angular, etc.)\n5. Configure generation options (database, API, tests)\n6. AI generates a complete new application\n\nPerfect for modernizing legacy systems or rebuilding applications in new technologies!';
    }
    
    // Project Migration
    if (message.includes('project') && message.includes('migration')) {
      return 'The **Full Project Migration** will help migrate entire projects:\n\n1. Select source framework (.NET Framework, Java 8)\n2. Choose target framework (.NET Core, Java 21)\n3. Upload complete project\n4. AI analyzes architecture and dependencies\n5. Get migrated project with modern patterns\n\nThis feature is currently under development!';
    }
    
    // Getting Started
    if (message.includes('start') || message.includes('begin') || message.includes('how to use')) {
      return 'Welcome to the Code Migration Platform! Here\'s how to get started:\n\n**First Time Setup:**\n1. Configure Azure OpenAI credentials (see the configuration guide at the top)\n2. Choose a migration tool from the main page\n\n**Most Popular Features:**\n• **Code Language Converter** - Convert legacy code to modern languages\n• **Business Logic Extractor** - Extract logic and generate new applications\n• **Database Migration** - Convert between database systems\n• **Documentation Generator** - Create comprehensive docs\n\nEach tool has a step-by-step wizard to guide you through the process!';
    }
    
    // Configuration Help
    if (message.includes('config') || message.includes('setup') || message.includes('azure')) {
      return 'To configure Azure OpenAI:\n\n1. **Create Azure OpenAI Resource** in Azure Portal\n2. **Deploy GPT-4 Model** in Azure OpenAI Studio\n3. **Get API Credentials** from Keys and Endpoint section\n4. **Create .env file** with:\n   - VITE_AZURE_OPENAI_ENDPOINT\n   - VITE_AZURE_OPENAI_API_KEY\n   - VITE_AZURE_OPENAI_DEPLOYMENT_NAME\n   - VITE_AZURE_OPENAI_API_VERSION\n\nSee the configuration guide at the top of the page for detailed instructions!';
    }
    
    // File Upload Help
    if (message.includes('upload') || message.includes('file') || message.includes('folder')) {
      return 'File Upload Tips:\n\n**Supported Methods:**\n• Drag & drop files or folders\n• Click "Select Files" for individual files\n• Click "Select Folder" for entire projects\n\n**Supported File Types:**\n• Code files (.js, .py, .java, .cs, .cpp, etc.)\n• Database files (.sql, .ddl, .psql)\n• Config files (.json, .xml, .yaml)\n• Documentation (.md, .txt)\n\n**Best Practices:**\n• Upload complete project folders for best results\n• Include configuration and documentation files\n• Larger projects are processed in chunks automatically';
    }
    
    // Features Overview
    if (message.includes('features') || message.includes('what can') || message.includes('capabilities')) {
      return 'Platform Capabilities:\n\n🔄 **Code Language Converter**\n• Convert 30+ languages (COBOL→Java, Fortran→Python)\n• AI-powered analysis and optimization\n\n🗄️ **Database Migration**\n• Convert between 15+ database systems\n• Schema and query optimization\n\n📚 **Documentation Generator**\n• Auto-generate README, API docs, user guides\n• Multiple documentation formats\n\n📊 **Code Quality Analysis**\n• Comprehensive quality metrics\n• Security and performance analysis\n\n🧠 **Business Logic Extractor**\n• Extract logic from any codebase\n• Generate complete new applications\n\nAll powered by Azure OpenAI GPT-4!';
    }
    
    // Default responses for common questions
    if (message.includes('help') || message.includes('?')) {
      return 'I\'m here to help! You can ask me about:\n\n• How to use any specific feature\n• Getting started with the platform\n• File upload and configuration\n• Troubleshooting issues\n• Platform capabilities\n\nJust type your question and I\'ll provide detailed guidance!';
    }
    
    // Default response
    return 'I\'d be happy to help! You can ask me about:\n\n• **Getting Started** - How to begin using the platform\n• **Code Conversion** - Converting between programming languages\n• **Database Migration** - Migrating database schemas and queries\n• **Documentation** - Generating project documentation\n• **Business Logic** - Extracting logic and generating new projects\n• **Configuration** - Setting up Azure OpenAI\n• **File Upload** - How to upload files and projects\n\nWhat would you like to know more about?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: inputMessage }];
    setConversationHistory(newHistory);

    try {
      let responseContent: string;
      
      if (useAI && isAIConfigured) {
        // Use AI for response
        responseContent = await chatbotAIService.getChatbotResponse(inputMessage, conversationHistory);
      } else {
        // Use static responses as fallback
        responseContent = getStaticResponse(inputMessage);
      }
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Update conversation history with bot response
      setConversationHistory(prev => [...prev, { role: 'assistant', content: responseContent }]);
      
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      // Fallback to static response on error
      const fallbackResponse = getStaticResponse(inputMessage);
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to JSX
    const parts = content.split(/(\*\*.*?\*\*|\n)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-blue-600">{part.slice(2, -2)}</strong>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return part;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Need help? Ask me!
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Mordenize Assistant</h3>
            <p className="text-xs text-gray-600">
              {isAIConfigured && useAI ? (
                <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>AI Powered</span>
              ) : (
                'How can I help you today?'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.type === 'bot' ? formatMessage(message.content) : message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about using the platform..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  !inputMessage.trim() || isTyping
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {isAIConfigured && useAI && (
                <span className="block text-green-600 mt-1">✨Ask about features, getting started, or how to use this tool</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};