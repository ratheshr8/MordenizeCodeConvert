class ChatbotAIService {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;

  constructor() {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    
    if (!endpoint || !apiKey) {
      throw new Error('Azure OpenAI configuration is missing');
    }

    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, options: { temperature: number; maxTokens: number }): Promise<any> {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chatbot AI request failed:', error);
      throw error;
    }
  }

  async getChatbotResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant for the Code Migration Platform. Your role is to help users understand and navigate the platform's features.

PLATFORM FEATURES:
1. **Code Language Converter** - Convert legacy code (COBOL, Fortran, etc.) to modern languages (Python, Java, C#, etc.)
2. **Database Schema & Query Converter** - Migrate between database systems (Oracle→PostgreSQL, SQL Server→MySQL, etc.)
3. **Code Documentation Generator** - Generate comprehensive documentation (README, API docs, user guides)
4. **Code Quality Analysis** - Analyze code quality, complexity, security, and performance
5. **Business Logic Extractor & Project Generator** - Extract business logic from existing projects and generate complete new applications
6. **Full Project Migration** - Migrate entire projects between frameworks (.NET Framework→.NET Core, etc.)

GUIDELINES:
- Provide clear, step-by-step instructions
- Be helpful and encouraging
- Focus on practical guidance
- Use bullet points and numbered lists for clarity
- Mention specific features and capabilities
- If asked about configuration, guide them to the Azure OpenAI setup
- Keep responses concise but comprehensive
- Use markdown formatting for better readability

IMPORTANT: Only help with using the Code Migration Platform. Do not provide general programming help or unrelated assistance.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: userMessage }
      ];

      const response = await this.makeRequest(messages, {
        temperature: 0.7,
        maxTokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return content;
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Fallback to static responses if AI fails
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cobol') && message.includes('python')) {
      return `To **convert COBOL to Python**:

**Step-by-Step Process:**
1. Click "Code Language Converter" from the main page
2. **Select Source Language**: Choose COBOL from the Legacy category
3. **Select Target Language**: Choose Python from the Modern category
4. **Configure Options**: Enable "Preserve Comments", "Generate Documentation", "Optimize Code"
5. **Upload Files**: Drop your .cob or .cbl COBOL files
6. **AI Analysis**: GPT-4 analyzes your COBOL code structure
7. **Generate Workflow**: View the conversion workflow and flow chart
8. **Get Results**: Download converted Python code with tests and documentation

**What You Get:**
• Clean, modern Python code
• Comprehensive documentation
• Unit tests
• Migration notes and warnings

The AI understands COBOL business logic and converts it to Pythonic patterns!`;
    }

    if (message.includes('business logic')) {
      return `The **Business Logic Extractor & Project Generator** is our most powerful feature:

**How it works:**
1. Upload your complete existing project
2. AI extracts core business logic and rules
3. Edit and refine the extracted business logic
4. Select target framework (React, Vue, Angular, etc.)
5. Configure generation options (database, API, tests)
6. AI generates a complete new application

**Perfect for:**
• Modernizing legacy systems
• Rebuilding applications in new technologies
• Extracting business value from old codebases

This feature can transform any existing application into a modern, production-ready system!`;
    }

    return `I'm here to help you use the Code Migration Platform! You can ask me about:

• **Getting Started** - How to begin using the platform
• **Code Conversion** - Converting between programming languages
• **Database Migration** - Migrating database schemas and queries
• **Documentation** - Generating project documentation
• **Business Logic** - Extracting logic and generating new projects
• **Configuration** - Setting up Azure OpenAI

What would you like to know more about?`;
  }
}

export const chatbotAIService = new ChatbotAIService();