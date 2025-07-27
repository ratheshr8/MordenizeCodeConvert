import { 
  BusinessLogicExtractionResult, 
  BusinessLogicGenerationResult, 
  BusinessLogicGenerationOptions,
  BusinessLogicFile 
} from '../types/businessLogic';

class BusinessLogicAIService {
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

  private async makeRequest(messages: Array<{ role: string; content: string }>, options: { temperature: number; maxTokens: number }, retryCount = 0): Promise<any> {
    const maxRetries = 2;
    const baseDelay = 3000;
    
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
        if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          console.warn(`API request failed with status ${response.status}. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(messages, options, retryCount + 1);
        }
        
        throw new Error(`Azure OpenAI API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error && !error.message.includes('Azure OpenAI API request failed:')) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.warn(`Network error occurred. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(messages, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  private chunkContent(content: string, maxChunkSize: number = 4000): string[] {
    if (content.length <= maxChunkSize) {
      return [content];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      let endIndex = currentIndex + maxChunkSize;
      
      if (endIndex < content.length) {
        const breakPoints = [
          '\nclass ',
          '\nfunction ',
          '\ncomponent ',
          '\ninterface ',
          '\ntype ',
          '\nimport ',
          '\nexport ',
          '\n// ',
          '\n/*',
          '\n\n'
        ];
        
        let bestBreak = endIndex;
        for (const breakPoint of breakPoints) {
          const breakIndex = content.lastIndexOf(breakPoint, endIndex);
          if (breakIndex > currentIndex && breakIndex < endIndex) {
            bestBreak = breakIndex;
            break;
          }
        }
        
        if (bestBreak === endIndex) {
          const newlineIndex = content.lastIndexOf('\n', endIndex);
          if (newlineIndex > currentIndex) {
            bestBreak = newlineIndex;
          }
        }
        
        endIndex = bestBreak;
      }
      
      chunks.push(content.slice(currentIndex, endIndex));
      currentIndex = endIndex;
    }

    console.log(`Split content into ${chunks.length} chunks (max size: ${maxChunkSize} chars)`);
    return chunks;
  }

  private async processChunkedExtraction(chunks: string[]): Promise<BusinessLogicExtractionResult> {
    const progressCallback = (current: number, total: number) => {
      window.dispatchEvent(new CustomEvent('chunkProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      }));
    };

    const chunkResults: BusinessLogicExtractionResult[] = [];
    
    console.log(`Processing ${chunks.length} chunks for business logic extraction...`);
    progressCallback(0, chunks.length);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
      progressCallback(i, chunks.length);
      
      const prompt = `
        Extract business logic from the following code chunk (${i + 1}/${chunks.length}):

        ${chunk}

        Please provide your analysis in the following JSON format:
        {
          "extractedLogic": "Detailed business logic description",
          "businessRules": ["rule1", "rule2", ...],
          "dataModels": ["model1", "model2", ...],
          "workflows": ["workflow1", "workflow2", ...],
          "integrations": ["integration1", "integration2", ...],
          "validationRules": ["validation1", "validation2", ...],
          "businessProcesses": ["process1", "process2", ...],
          "summary": "Brief summary of business logic",
          "confidence": 85,
          "recommendations": ["rec1", "rec2", ...]
        }

        Focus on extracting the core business logic, rules, and processes from this code chunk.
      `;

      try {
        const response = await this.makeRequest(
          [
            {
              role: 'system',
              content: 'You are an expert business analyst and software architect. Extract business logic from code chunks and provide detailed analysis in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          {
            temperature: 0.3,
            maxTokens: 2000,
          }
        );

        const content = response.choices[0]?.message?.content;
        if (!content) {
          console.warn(`No response for chunk ${i + 1}, skipping...`);
          continue;
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn(`Invalid JSON response for chunk ${i + 1}, skipping...`);
          continue;
        }

        const chunkResult = JSON.parse(jsonMatch[0]);
        chunkResults.push(chunkResult);
        console.log(`Successfully processed chunk ${i + 1}/${chunks.length}`);
        progressCallback(i + 1, chunks.length);
        
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`Completed processing ${chunkResults.length}/${chunks.length} chunks successfully`);
    
    if (chunkResults.length === 0) {
      throw new Error('Failed to process any chunks successfully');
    }
    
    return this.mergeExtractionResults(chunkResults);
  }

  private mergeExtractionResults(results: BusinessLogicExtractionResult[]): BusinessLogicExtractionResult {
    const merged: BusinessLogicExtractionResult = {
      extractedLogic: '',
      businessRules: [],
      dataModels: [],
      workflows: [],
      integrations: [],
      validationRules: [],
      businessProcesses: [],
      summary: '',
      confidence: 0,
      recommendations: []
    };

    // Merge extracted logic
    const allLogic = results.map(r => r.extractedLogic).filter(l => l);
    merged.extractedLogic = allLogic.join('\n\n');

    // Merge and deduplicate arrays
    const allBusinessRules = results.flatMap(r => r.businessRules || []);
    merged.businessRules = [...new Set(allBusinessRules)];

    const allDataModels = results.flatMap(r => r.dataModels || []);
    merged.dataModels = [...new Set(allDataModels)];

    const allWorkflows = results.flatMap(r => r.workflows || []);
    merged.workflows = [...new Set(allWorkflows)];

    const allIntegrations = results.flatMap(r => r.integrations || []);
    merged.integrations = [...new Set(allIntegrations)];

    const allValidationRules = results.flatMap(r => r.validationRules || []);
    merged.validationRules = [...new Set(allValidationRules)];

    const allBusinessProcesses = results.flatMap(r => r.businessProcesses || []);
    merged.businessProcesses = [...new Set(allBusinessProcesses)];

    const allRecommendations = results.flatMap(r => r.recommendations || []);
    merged.recommendations = [...new Set(allRecommendations)];

    // Calculate average confidence
    const confidenceScores = results.map(r => r.confidence || 0).filter(c => c > 0);
    merged.confidence = confidenceScores.length > 0 
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : 0;

    // Create comprehensive summary
    merged.summary = `Comprehensive business logic extracted from ${results.length} code sections. ` +
      `Identified ${merged.businessRules.length} business rules, ${merged.dataModels.length} data models, ` +
      `and ${merged.workflows.length} workflows with ${merged.confidence}% confidence.`;

    return merged;
  }

  async extractBusinessLogic(files: BusinessLogicFile[]): Promise<BusinessLogicExtractionResult> {
    try {
      // Focus on high and medium relevance files for business logic extraction
      const relevantFiles = files.filter(file => 
        file.businessLogicRelevance === 'high' || file.businessLogicRelevance === 'medium'
      );
      
      const codeContent = relevantFiles.map(file => 
        `// File: ${file.path} (${file.language}) - Relevance: ${file.businessLogicRelevance}\n${file.content || ''}`
      ).join('\n\n');
      
      if (codeContent.length > 6000) {
        console.log(`Large content detected (${codeContent.length} characters), using chunked extraction...`);
        const chunks = this.chunkContent(codeContent);
        return await this.processChunkedExtraction(chunks);
      }
      
      const prompt = `
        Extract comprehensive business logic from the following project files:

        ${codeContent}

        Please provide your analysis in the following JSON format:
        {
          "extractedLogic": "Detailed business logic description in plain language",
          "businessRules": ["rule1", "rule2", ...],
          "dataModels": ["model1", "model2", ...],
          "workflows": ["workflow1", "workflow2", ...],
          "integrations": ["integration1", "integration2", ...],
          "validationRules": ["validation1", "validation2", ...],
          "businessProcesses": ["process1", "process2", ...],
          "summary": "Brief summary of the business logic",
          "confidence": 85,
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on:
        1. Core business rules and logic
        2. Data models and relationships
        3. Business workflows and processes
        4. Validation and business constraints
        5. External integrations and dependencies
        6. User interactions and business flows
        
        Extract the business logic in a technology-agnostic way that can be used to rebuild the application in any framework.
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert business analyst and software architect. Extract comprehensive business logic from code and provide detailed analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 3000,
        }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Azure OpenAI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error extracting business logic:', error);
      throw new Error('Failed to extract business logic with Azure GPT-4');
    }
  }

  async generateCompleteProject(
    businessLogic: string,
    targetFramework: string,
    options: BusinessLogicGenerationOptions
  ): Promise<BusinessLogicGenerationResult> {
    try {
      const optionsText = Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'includeDatabase': return 'Include database schema and models';
            case 'includeAPI': return 'Generate REST API endpoints';
            case 'includeFrontend': return 'Create frontend user interface';
            case 'includeTests': return 'Generate comprehensive tests';
            case 'includeDocumentation': return 'Create project documentation';
            case 'includeDeployment': return 'Add deployment configuration';
            case 'addAuthentication': return 'Implement user authentication';
            case 'addLogging': return 'Add logging and monitoring';
            case 'addErrorHandling': return 'Implement error handling';
            case 'optimizePerformance': return 'Apply performance optimizations';
            case 'followBestPractices': return 'Follow framework best practices';
            default: return key;
          }
        })
        .join(', ');

      const prompt = `
        Generate a complete ${targetFramework} project based on the following business logic:

        Business Logic:
        ${businessLogic}

        Generation Requirements:
        ${optionsText}

        Please provide your response in the following JSON format:
        {
          "projectName": "Generated project name",
          "description": "Project description",
          "summary": "Brief summary of what was generated",
          "filesGenerated": 15,
          "warnings": ["warning1", "warning2", ...],
          "appliedOptions": ["option1", "option2", ...],
          "architecture": ["architecture pattern1", "pattern2", ...],
          "technologies": ["tech1", "tech2", ...],
          "generatedFiles": [
            {
              "name": "App.tsx",
              "path": "src/App.tsx",
              "content": "complete file content here",
              "type": "code",
              "framework": "${targetFramework}"
            }
          ],
          "setupInstructions": "Step-by-step setup instructions",
          "deploymentGuide": "Deployment instructions",
          "nextSteps": ["step1", "step2", ...]
        }

        Generate a complete, production-ready project that implements all the business logic:
        1. Create all necessary files for a working application
        2. Implement the business logic accurately
        3. Follow ${targetFramework} best practices and conventions
        4. Include proper project structure and organization
        5. Add comprehensive error handling and validation
        6. Generate realistic sample data where appropriate
        7. Include configuration files and dependencies
        8. Create deployment-ready code
        
        Make sure the generated project is:
        - Complete and functional
        - Well-structured and organized
        - Following modern development practices
        - Ready for production deployment
        - Properly documented
        
        Generate at least 10-20 files to create a comprehensive project structure.
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert full-stack developer and software architect. Generate complete, production-ready projects based on business logic requirements. CRITICAL: Always return valid JSON format with proper escaping of all string content. Ensure all arrays have proper comma separation and all objects are properly closed.'
          },
          {
            role: 'user',
            content: prompt + '\n\nIMPORTANT: Ensure the JSON response is strictly valid with proper escaping of quotes and special characters in all string content. All array elements must be properly separated with commas.'
          }
        ],
        {
          temperature: 0.2,
          maxTokens: 8000,
        }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Azure OpenAI');
      }

      // Find the JSON content more carefully
      let jsonContent = content.trim();
      
      // If the response starts with markdown code blocks, extract the JSON
      if (jsonContent.startsWith('```json')) {
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonContent = jsonContent.slice(jsonStart, jsonEnd + 1);
        }
      } else {
        // Find the first { and last } to extract JSON
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonContent = jsonContent.slice(jsonStart, jsonEnd + 1);
        }
      }
      
      if (!jsonContent || !jsonContent.startsWith('{')) {
        throw new Error('Invalid JSON response format from AI');
      }

      // Validate and parse JSON with better error handling
      let parsedResult;
      try {
        parsedResult = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw content:', content);
        console.error('Extracted JSON:', jsonContent);
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
      return parsedResult;
    } catch (error) {
      console.error('Error generating complete project:', error);
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`JSON parsing failed: ${error.message}`);
      }
      throw new Error(`Failed to generate complete project with Azure GPT-4: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const businessLogicAIService = new BusinessLogicAIService();