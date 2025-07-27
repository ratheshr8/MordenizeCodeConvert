import { AnalysisResult, WorkflowStep, ConversionResult, ConversionOptions } from '../types';
import { FlowChart } from '../types';

class AzureAIService {
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
    const baseDelay = 3000; // 3 seconds
    
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
        // Handle rate limiting (429) and server errors (5xx) with retry
        if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.warn(`API request failed with status ${response.status}. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(messages, options, retryCount + 1);
        }
        
        throw new Error(`Azure OpenAI API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network errors with retry
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
      
      // If we're not at the end, try to find a good breaking point
      if (endIndex < content.length) {
        // Look for COBOL-specific breaking points
        const breakPoints = [
          '\n       PROCEDURE DIVISION',
          '\n       DATA DIVISION',
          '\n       WORKING-STORAGE SECTION',
          '\n       IDENTIFICATION DIVISION',
          '\n       ENVIRONMENT DIVISION',
          '\n       01 ',
          '\n       77 ',
          '\n       PERFORM ',
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
        
        // If no good break point found, look for any newline
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

  private async processChunkedAnalysis(chunks: string[], sourceLanguage: string): Promise<AnalysisResult> {
    const progressCallback = (current: number, total: number) => {
      // Dispatch custom event for progress updates
      window.dispatchEvent(new CustomEvent('chunkProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      }));
    };

    const chunkResults: AnalysisResult[] = [];
    
    console.log(`Processing ${chunks.length} chunks for ${sourceLanguage} analysis...`);
    progressCallback(0, chunks.length);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
      progressCallback(i, chunks.length);
      
      const prompt = `
        Analyze the following ${sourceLanguage} code chunk (${i + 1}/${chunks.length}) and provide analysis:

        ${chunk}

        Please provide your analysis in the following JSON format:
        {
          "languageFeatures": ["feature1", "feature2", ...],
          "programOverview": "Brief overview of what this code chunk does",
          "businessLogic": ["logic1", "logic2", ...],
          "dataProcessingFlow": ["step1", "step2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on this specific chunk while considering it's part of a larger codebase.
      `;

      try {
        const response = await this.makeRequest(
          [
            {
              role: 'system',
              content: 'You are an expert software architect and code analyst. Provide detailed, accurate analysis of code chunks in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          {
            temperature: 0.3,
            maxTokens: 1500,
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
        
        // Add delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        // Continue with other chunks instead of failing completely
        continue;
      }
    }

    console.log(`Completed processing ${chunkResults.length}/${chunks.length} chunks successfully`);
    
    if (chunkResults.length === 0) {
      throw new Error('Failed to process any chunks successfully');
    }
    
    // Merge results from all chunks
    return this.mergeAnalysisResults(chunkResults);
  }

  private mergeAnalysisResults(results: AnalysisResult[]): AnalysisResult {
    const merged: AnalysisResult = {
      languageFeatures: [],
      programOverview: '',
      businessLogic: [],
      dataProcessingFlow: [],
      recommendations: []
    };

    // Merge language features (remove duplicates)
    const allFeatures = results.flatMap(r => r.languageFeatures);
    merged.languageFeatures = [...new Set(allFeatures)];

    // Combine program overviews
    const overviews = results.map(r => r.programOverview).filter(o => o);
    merged.programOverview = overviews.length > 1 
      ? `This program consists of multiple components: ${overviews.join('; ')}`
      : overviews[0] || 'Complex multi-component program';

    // Merge business logic (remove duplicates)
    const allLogic = results.flatMap(r => r.businessLogic);
    merged.businessLogic = [...new Set(allLogic)];

    // Merge data processing flow (remove duplicates)
    const allFlow = results.flatMap(r => r.dataProcessingFlow);
    merged.dataProcessingFlow = [...new Set(allFlow)];

    // Merge recommendations (remove duplicates)
    const allRecommendations = results.flatMap(r => r.recommendations);
    merged.recommendations = [...new Set(allRecommendations)];

    return merged;
  }

  async analyzeCode(files: any[], sourceLanguage: string): Promise<AnalysisResult> {
    try {
      const codeContent = files.map(file => `// File: ${file.name}\n${file.content || ''}`).join('\n\n');
      
      // Check if content is too large and needs chunking
      if (codeContent.length > 6000) {
        console.log(`Large content detected (${codeContent.length} characters), using chunked analysis...`);
        const chunks = this.chunkContent(codeContent);
        return await this.processChunkedAnalysis(chunks, sourceLanguage);
      }
      
      const prompt = `
        Analyze the following ${sourceLanguage} code and provide a comprehensive analysis:

        ${codeContent}

        Please provide your analysis in the following JSON format:
        {
          "languageFeatures": ["feature1", "feature2", ...],
          "programOverview": "Brief overview of what this program does",
          "businessLogic": ["logic1", "logic2", ...],
          "dataProcessingFlow": ["step1", "step2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on:
        1. Language-specific features used (OOP, functional programming, design patterns, etc.)
        2. Overall program purpose and functionality
        3. Key business logic components
        4. Data flow and processing steps
        5. Recommendations for modernization and best practices
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert software architect and code analyst. Provide detailed, accurate analysis of code in JSON format.'
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
        throw new Error('No response from Azure OpenAI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw new Error('Failed to analyze code with Azure GPT-4');
    }
  }

  async generateWorkflow(sourceLanguage: string, targetLanguage: string): Promise<WorkflowStep[]> {
    try {
      const prompt = `
        Generate a detailed workflow for analyzing and understanding ${sourceLanguage} code structure and logic flow.
        
        Provide the response in the following JSON format:
        {
          "steps": [
            {
              "id": "1",
              "title": "Step Title",
              "description": "Detailed description of what this step does",
              "status": "pending"
            }
          ]
        }

        Include steps for analyzing ${sourceLanguage} code:
        1. Parse and understand code structure
        2. Identify main functions and methods
        3. Map data flow and dependencies
        4. Analyze control flow and logic paths
        5. Document key algorithms and patterns
        6. Summarize overall program architecture

        Make sure each step has a clear, actionable description.
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert in software analysis and code comprehension. Generate detailed, practical workflow steps for understanding code structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 1500,
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

      const result = JSON.parse(jsonMatch[0]);
      return result.steps.map((step: any, index: number) => ({
        ...step,
        status: index === 0 ? 'completed' : index === 1 ? 'active' : 'pending'
      }));
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw new Error('Failed to generate workflow with Azure GPT-4');
    }
  }

  async generateFlowChart(files: any[], sourceLanguage: string): Promise<FlowChart> {
    try {
      const codeContent = files.map(file => `// File: ${file.name}\n${file.content || ''}`).join('\n\n');
      
      const prompt = `
        Analyze the following ${sourceLanguage} code and generate a detailed flow chart representing the program's logic flow and execution path.
        
        Code to analyze:
        ${codeContent}
        
        Provide the response in the following JSON format:
        {
          "nodes": [
            {
              "id": "1",
              "type": "start|process|decision|end",
              "title": "Node Title",
              "description": "Brief description",
              "x": 100,
              "y": 50
            }
          ],
          "connections": [
            {
              "from": "1",
              "to": "2",
              "label": "Optional label"
            }
          ]
        }

        Create a flow chart that represents the actual code logic:
        1. Start node
        2. Main program entry point
        3. Key functions and methods as process nodes
        4. Decision points (if/else, loops, switches) from the actual code
        5. Data processing steps
        6. End node

        Position nodes with appropriate x,y coordinates (0-800 for x, 0-600 for y) to create a clear, readable flow.
        Use node types: "start" for program start, "process" for functions/operations, "decision" for conditionals/loops, "end" for program end.
        
        Base the flow chart on the actual code structure and logic, not on a generic conversion process.
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert in software analysis and code visualization. Create clear, logical flow charts that represent the actual program logic and execution flow.'
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
        throw new Error('No response from Azure OpenAI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating flow chart:', error);
      throw new Error('Failed to generate flow chart with Azure GPT-4');
    }
  }

  async convertCode(
    files: any[],
    sourceLanguage: string,
    targetLanguage: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    try {
      const codeContent = files.map(file => `// File: ${file.name}\n${file.content || ''}`).join('\n\n');
      
      const optionsText = Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'preserveComments': return 'Preserve original comments';
            case 'generateDocs': return 'Generate comprehensive documentation';
            case 'optimizeCode': return 'Apply modern optimization techniques';
            case 'includeTests': return 'Include unit tests';
            default: return key;
          }
        })
        .join(', ');

      const prompt = `
        Convert the following ${sourceLanguage} code to ${targetLanguage}.
        
        Conversion requirements:
        ${optionsText}

        Original code:
        ${codeContent}

        Please provide your response in the following JSON format:
        {
          "originalCode": "The original code",
          "convertedCode": "The converted code with all improvements",
          "summary": "Brief summary of the conversion",
          "changes": ["change1", "change2", ...],
          "filesGenerated": 1,
          "warnings": ["warning1", "warning2", ...],
          "appliedSettings": ["setting1", "setting2", ...],
          "optimizations": ["optimization1", "optimization2", ...],
          "documentationGenerated": true,
          "convertedFiles": [
            {
              "name": "main.py",
              "content": "converted code content",
              "type": "code"
            },
            {
              "name": "test_main.py", 
              "content": "unit test content",
              "type": "test"
            },
            {
              "name": "README.md",
              "content": "documentation content", 
              "type": "documentation"
            }
          ]
        }

        Ensure the converted code:
        1. Follows ${targetLanguage} best practices and conventions
        2. Is production-ready and well-structured
        3. Includes proper error handling
        4. Maintains the original functionality
        ${options.optimizeCode ? '5. Uses modern language features and optimization techniques' : '5. Uses standard language features without aggressive optimization'}
        ${options.includeTests ? '6. Includes comprehensive unit tests in separate test files' : ''}
        ${options.generateDocs ? '7. Has detailed documentation and comments' : ''}
        
        ${options.optimizeCode ? `
        Apply these optimizations:
        - Use modern language features and patterns
        - Optimize performance where possible
        - Apply design patterns and best practices
        - Improve code structure and readability
        - Use efficient algorithms and data structures
        ` : `
        Optimization approach:
        - Keep the code simple and straightforward
        - Focus on correctness over performance optimization
        - Use standard language features without advanced optimizations
        - Maintain clear, readable code structure
        `}
        
        ${options.includeTests ? `
        For unit tests:
        - Create separate test files with appropriate naming conventions for ${targetLanguage}
        - Include comprehensive test coverage for all functions and methods
        - Use appropriate testing frameworks for ${targetLanguage}
        - Include both positive and negative test cases
        - Add setup and teardown methods where needed
        ` : ''}
        
        ${options.generateDocs ? `
        For documentation:
        - Create README.md with project overview, setup instructions, and usage examples
        - Include inline code documentation and comments
        - Document API endpoints, function signatures, and parameters
        ` : ''}
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert software developer proficient in multiple programming languages. Convert code accurately while applying modern best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.2,
          maxTokens: 4000,
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
      console.error('Error converting code:', error);
      throw new Error('Failed to convert code with Azure GPT-4');
    }
  }
}

export const azureAIService = new AzureAIService();