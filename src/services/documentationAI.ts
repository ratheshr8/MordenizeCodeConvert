import { DocumentationAnalysisResult, DocumentationResult, DocumentationOptions, CodeFile } from '../types/documentation';

class DocumentationAIService {
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

  private async makeRequest(messages: Array<{ role: string; content: string }>, options: { temperature: number; maxTokens: number }) {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
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
  }

  async analyzeCodeForDocumentation(files: CodeFile[]): Promise<DocumentationAnalysisResult> {
    try {
      const codeContent = files.map(file => `// File: ${file.name} (${file.language})\n${file.content || ''}`).join('\n\n');
      
      // Check if content is too large and needs chunking
      if (codeContent.length > 6000) {
        console.log(`Large content detected (${codeContent.length} characters), using chunked analysis...`);
        return await this.processChunkedAnalysisForDocumentation(codeContent);
      }

      const prompt = `
        Analyze the following code for documentation generation:

        ${codeContent}

        Please provide your analysis in the following JSON format:
        {
          "codeStructure": ["component1", "component2", ...],
          "mainComponents": ["main function", "key classes", ...],
          "apiEndpoints": ["endpoint1", "endpoint2", ...],
          "dependencies": ["dependency1", "dependency2", ...],
          "complexity": "Low/Medium/High",
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on:
        1. Overall code structure and architecture
        2. Main components, classes, and functions
        3. API endpoints or public interfaces
        4. External dependencies and libraries
        5. Code complexity assessment
        6. Recommendations for documentation approach
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert technical writer and code analyst. Analyze code to understand its structure and provide recommendations for comprehensive documentation.'
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
      console.error('Error analyzing code for documentation:', error);
      throw new Error('Failed to analyze code with Azure GPT-4');
    }
  }

  private chunkContent(content: string, maxChunkSize: number = 4000): string[] {
    if (content.length <= maxChunkSize) {
      return [content];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      let chunkEnd = Math.min(currentIndex + maxChunkSize, content.length);
      
      // Try to find a natural breaking point (class, function, method)
      if (chunkEnd < content.length) {
        const breakPoints = [
          // COBOL-specific breaking points
          content.lastIndexOf('\n       PROCEDURE DIVISION', chunkEnd),
          content.lastIndexOf('\n       DATA DIVISION', chunkEnd),
          content.lastIndexOf('\n       WORKING-STORAGE SECTION', chunkEnd),
          content.lastIndexOf('\n       01 ', chunkEnd),
          content.lastIndexOf('\n       77 ', chunkEnd),
          content.lastIndexOf('\n       PERFORM ', chunkEnd),
          // General breaking points
          content.lastIndexOf('\nclass ', chunkEnd),
          content.lastIndexOf('\nfunction ', chunkEnd),
          content.lastIndexOf('\nconst ', chunkEnd),
          content.lastIndexOf('\nlet ', chunkEnd),
          content.lastIndexOf('\nvar ', chunkEnd),
          content.lastIndexOf('\n// File:', chunkEnd)
        ];
        
        const bestBreakPoint = Math.max(...breakPoints.filter(bp => bp > currentIndex));
        if (bestBreakPoint > currentIndex) {
          chunkEnd = bestBreakPoint;
        } else {
          // Fallback to newline
          const newlineIndex = content.lastIndexOf('\n', chunkEnd);
          if (newlineIndex > currentIndex) {
            chunkEnd = newlineIndex;
          }
        }
      }

      chunks.push(content.substring(currentIndex, chunkEnd));
      currentIndex = chunkEnd;
    }

    console.log(`Split content into ${chunks.length} chunks (max size: ${maxChunkSize} chars)`);
    return chunks;
  }

  private async processChunkedAnalysisForDocumentation(codeContent: string): Promise<DocumentationAnalysisResult> {
    const chunks = this.chunkContent(codeContent);
    const progressCallback = (current: number, total: number) => {
      // Dispatch custom event for progress updates
      window.dispatchEvent(new CustomEvent('chunkProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      }));
    };

    const chunkResults: DocumentationAnalysisResult[] = [];

    console.log(`Processing ${chunks.length} chunks for documentation analysis...`);
    progressCallback(0, chunks.length);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
      progressCallback(i, chunks.length);
      
      const prompt = `
        Analyze the following code chunk (${i + 1}/${chunks.length}) for documentation generation:

        ${chunk}

        Please provide your analysis in the following JSON format:
        {
          "codeStructure": ["component1", "component2", ...],
          "mainComponents": ["main function", "key classes", ...],
          "apiEndpoints": ["endpoint1", "endpoint2", ...],
          "dependencies": ["dependency1", "dependency2", ...],
          "complexity": "Low/Medium/High",
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on:
        1. Overall code structure and architecture
        2. Main components, classes, and functions
        3. API endpoints or public interfaces
        4. External dependencies and libraries
        5. Code complexity assessment
        6. Recommendations for documentation approach
      `;

      try {
        const response = await this.makeRequest(
          [
            {
              role: 'system',
              content: 'You are an expert technical writer and code analyst. Analyze code to understand its structure and provide recommendations for comprehensive documentation.'
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

    return this.mergeDocumentationAnalysisResults(chunkResults);
  }

  private mergeDocumentationAnalysisResults(results: DocumentationAnalysisResult[]): DocumentationAnalysisResult {
    const merged: DocumentationAnalysisResult = {
      codeStructure: [],
      mainComponents: [],
      apiEndpoints: [],
      dependencies: [],
      complexity: 'Medium',
      recommendations: []
    };

    // Merge and deduplicate arrays
    const allCodeStructure = results.flatMap(r => r.codeStructure || []);
    merged.codeStructure = [...new Set(allCodeStructure)];

    const allMainComponents = results.flatMap(r => r.mainComponents || []);
    merged.mainComponents = [...new Set(allMainComponents)];

    const allApiEndpoints = results.flatMap(r => r.apiEndpoints || []);
    merged.apiEndpoints = [...new Set(allApiEndpoints)];

    const allDependencies = results.flatMap(r => r.dependencies || []);
    merged.dependencies = [...new Set(allDependencies)];

    const allRecommendations = results.flatMap(r => r.recommendations || []);
    merged.recommendations = [...new Set(allRecommendations)];

    // Determine overall complexity (take the highest)
    const complexityLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const maxComplexity = Math.max(...results.map(r => complexityLevels[r.complexity as keyof typeof complexityLevels] || 2));
    merged.complexity = Object.keys(complexityLevels).find(key => complexityLevels[key as keyof typeof complexityLevels] === maxComplexity) as 'Low' | 'Medium' | 'High' || 'Medium';

    return merged;
  }

  async generateDocumentation(
    files: CodeFile[],
    documentationType: string,
    options: DocumentationOptions
  ): Promise<DocumentationResult> {
    try {
      const codeContent = files.map(file => `// File: ${file.name} (${file.language})\n${file.content || ''}`).join('\n\n');
      
      const optionsText = Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'includeCodeExamples': return 'Include practical code examples';
            case 'generateDiagrams': return 'Generate architecture diagrams';
            case 'includeAPIReference': return 'Include comprehensive API reference';
            case 'addInstallationGuide': return 'Add detailed installation instructions';
            case 'generateTOC': return 'Generate table of contents';
            case 'includeChangelog': return 'Include version history and changelog';
            default: return key;
          }
        })
        .join(', ');

      const documentationTypeInstructions = this.getDocumentationTypeInstructions(documentationType);

      const prompt = `
        Generate comprehensive ${documentationType} documentation for the following code:
        
        Documentation requirements:
        ${optionsText}

        Code to document:
        ${codeContent}

        ${documentationTypeInstructions}

        Please provide your response in the following JSON format:
        {
          "originalCode": "Brief summary of the original code",
          "generatedDocumentation": "The complete generated documentation",
          "summary": "Brief summary of the documentation generated",
          "sections": ["section1", "section2", ...],
          "filesGenerated": 1,
          "warnings": ["warning1", "warning2", ...],
          "appliedSettings": ["setting1", "setting2", ...],
          "features": ["feature1", "feature2", ...],
          "documentationFiles": [
            {
              "name": "README.md",
              "content": "documentation content",
              "type": "documentation"
            },
            {
              "name": "API.md", 
              "content": "api documentation content",
              "type": "api"
            },
            {
              "name": "INSTALL.md",
              "content": "installation guide content", 
              "type": "guide"
            }
          ]
        }

        Ensure the documentation:
        1. Is comprehensive and well-structured
        2. Uses proper markdown formatting
        3. Includes clear examples and explanations
        4. Follows documentation best practices
        5. Is suitable for both technical and non-technical audiences
        ${options.includeCodeExamples ? '6. Includes practical, working code examples' : ''}
        ${options.generateDiagrams ? '7. Includes ASCII diagrams or mermaid syntax for visual representation' : ''}
        ${options.includeAPIReference ? '8. Provides detailed API reference with parameters and return values' : ''}
        ${options.addInstallationGuide ? '9. Includes step-by-step installation and setup instructions' : ''}
        ${options.generateTOC ? '10. Includes a comprehensive table of contents' : ''}
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert technical writer specializing in software documentation. Create clear, comprehensive, and well-structured documentation that serves both developers and end users.'
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
      console.error('Error generating documentation:', error);
      throw new Error('Failed to generate documentation with Azure GPT-4');
    }
  }

  private getDocumentationTypeInstructions(documentationType: string): string {
    const instructions: Record<string, string> = {
      'readme': `
        Create a comprehensive README.md that includes:
        - Project title and description
        - Installation instructions
        - Usage examples
        - API documentation (if applicable)
        - Contributing guidelines
        - License information
        Use proper markdown formatting with headers, code blocks, and lists.
      `,
      'api-docs': `
        Create detailed API documentation that includes:
        - Overview of all endpoints/methods
        - Request/response examples
        - Parameter descriptions
        - Error codes and handling
        - Authentication requirements
        - Rate limiting information
        Format as markdown with clear sections and code examples.
      `,
      'technical-spec': `
        Create a technical specification document that includes:
        - System architecture overview
        - Component descriptions
        - Data flow diagrams
        - Database schema (if applicable)
        - Security considerations
        - Performance requirements
        Use technical language appropriate for developers and architects.
      `,
      'user-guide': `
        Create a user-friendly guide that includes:
        - Getting started tutorial
        - Step-by-step instructions
        - Screenshots or visual aids (described)
        - Common use cases
        - FAQ section
        - Troubleshooting tips
        Write in clear, non-technical language for end users.
      `,
      'installation-guide': `
        Create detailed installation instructions that include:
        - System requirements
        - Prerequisites
        - Step-by-step installation process
        - Configuration options
        - Verification steps
        - Common installation issues
        Provide instructions for multiple platforms if applicable.
      `,
      'deployment-guide': `
        Create a deployment guide that includes:
        - Deployment prerequisites
        - Environment setup
        - Build and deployment steps
        - Configuration management
        - Monitoring and logging
        - Rollback procedures
        Include both development and production deployment scenarios.
      `
    };

    return instructions[documentationType] || instructions['readme'];
  }
}

export const documentationAIService = new DocumentationAIService();