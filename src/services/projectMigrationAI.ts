import { 
  ProjectAnalysisResult, 
  ProjectMigrationResult, 
  ProjectMigrationOptions, 
  ProjectFile 
} from '../types/projectMigration';

class ProjectMigrationAIService {
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

    console.log(`Split project content into ${chunks.length} chunks (max size: ${maxChunkSize} chars)`);
    return chunks;
  }

  private async processChunkedAnalysis(chunks: string[], sourceFramework: string): Promise<ProjectAnalysisResult> {
    const progressCallback = (current: number, total: number) => {
      window.dispatchEvent(new CustomEvent('chunkProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      }));
    };

    const chunkResults: ProjectAnalysisResult[] = [];
    
    console.log(`Processing ${chunks.length} chunks for project analysis...`);
    progressCallback(0, chunks.length);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
      progressCallback(i, chunks.length);
      
      const prompt = `
        Analyze the following ${sourceFramework} project chunk (${i + 1}/${chunks.length}) and provide analysis:

        ${chunk}

        Please provide your analysis in the following JSON format:
        {
          "architecture": ["pattern1", "pattern2", ...],
          "frameworks": ["framework1", "framework2", ...],
          "dependencies": ["dep1", "dep2", ...],
          "patterns": ["pattern1", "pattern2", ...],
          "complexity": "Low/Medium/High",
          "migrationChallenges": ["challenge1", "challenge2", ...],
          "recommendations": ["rec1", "rec2", ...],
          "estimatedEffort": "Small/Medium/Large"
        }

        Focus on this specific chunk while considering it's part of a larger project.
      `;

      try {
        const response = await this.makeRequest(
          [
            {
              role: 'system',
              content: 'You are an expert software architect and project migration specialist. Provide detailed, accurate analysis of project chunks in JSON format.'
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
    
    return this.mergeAnalysisResults(chunkResults);
  }

  private mergeAnalysisResults(results: ProjectAnalysisResult[]): ProjectAnalysisResult {
    const merged: ProjectAnalysisResult = {
      architecture: [],
      frameworks: [],
      dependencies: [],
      patterns: [],
      complexity: 'Medium',
      migrationChallenges: [],
      recommendations: [],
      estimatedEffort: 'Medium'
    };

    // Merge and deduplicate arrays
    const allArchitecture = results.flatMap(r => r.architecture);
    merged.architecture = [...new Set(allArchitecture)];

    const allFrameworks = results.flatMap(r => r.frameworks);
    merged.frameworks = [...new Set(allFrameworks)];

    const allDependencies = results.flatMap(r => r.dependencies);
    merged.dependencies = [...new Set(allDependencies)];

    const allPatterns = results.flatMap(r => r.patterns);
    merged.patterns = [...new Set(allPatterns)];

    const allChallenges = results.flatMap(r => r.migrationChallenges);
    merged.migrationChallenges = [...new Set(allChallenges)];

    const allRecommendations = results.flatMap(r => r.recommendations);
    merged.recommendations = [...new Set(allRecommendations)];

    // Determine overall complexity (take the highest)
    const complexityLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const maxComplexity = Math.max(...results.map(r => complexityLevels[r.complexity] || 2));
    merged.complexity = Object.keys(complexityLevels).find(key => complexityLevels[key as keyof typeof complexityLevels] === maxComplexity) as 'Low' | 'Medium' | 'High' || 'Medium';

    // Determine overall effort (take the highest)
    const effortLevels = { 'Small': 1, 'Medium': 2, 'Large': 3 };
    const maxEffort = Math.max(...results.map(r => effortLevels[r.estimatedEffort as keyof typeof effortLevels] || 2));
    merged.estimatedEffort = Object.keys(effortLevels).find(key => effortLevels[key as keyof typeof effortLevels] === maxEffort) || 'Medium';

    return merged;
  }

  async analyzeProject(files: ProjectFile[], sourceFramework: string): Promise<ProjectAnalysisResult> {
    try {
      const projectContent = files.map(file => `// File: ${file.path}\n// Type: ${file.type}\n// Language: ${file.language}\n${file.content || ''}`).join('\n\n');
      
      if (projectContent.length > 6000) {
        console.log(`Large project detected (${projectContent.length} characters), using chunked analysis...`);
        const chunks = this.chunkContent(projectContent);
        return await this.processChunkedAnalysis(chunks, sourceFramework);
      }
      
      const prompt = `
        Analyze the following ${sourceFramework} project and provide a comprehensive analysis:

        ${projectContent}

        Please provide your analysis in the following JSON format:
        {
          "architecture": ["architectural pattern1", "pattern2", ...],
          "frameworks": ["framework1", "framework2", ...],
          "dependencies": ["dependency1", "dependency2", ...],
          "patterns": ["design pattern1", "pattern2", ...],
          "complexity": "Low/Medium/High",
          "migrationChallenges": ["challenge1", "challenge2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...],
          "estimatedEffort": "Small/Medium/Large"
        }

        Focus on:
        1. Overall project architecture and patterns
        2. Frameworks and libraries used
        3. Key dependencies and integrations
        4. Design patterns and code organization
        5. Migration complexity assessment
        6. Potential challenges in migration
        7. Recommendations for successful migration
        8. Effort estimation for migration
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert software architect and project migration specialist. Provide detailed, accurate analysis of entire projects in JSON format.'
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
      console.error('Error analyzing project:', error);
      throw new Error('Failed to analyze project with Azure GPT-4');
    }
  }

  async migrateProject(
    files: ProjectFile[],
    sourceFramework: string,
    targetFramework: string,
    options: ProjectMigrationOptions
  ): Promise<ProjectMigrationResult> {
    try {
      const projectContent = files.map(file => `// File: ${file.path}\n// Type: ${file.type}\n// Language: ${file.language}\n${file.content || ''}`).join('\n\n');
      
      const optionsText = Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'preserveArchitecture': return 'Preserve existing architecture patterns';
            case 'modernizePatterns': return 'Apply modern design patterns';
            case 'updateDependencies': return 'Update to latest dependencies';
            case 'generateTests': return 'Generate comprehensive tests';
            case 'createDocumentation': return 'Create project documentation';
            case 'optimizePerformance': return 'Apply performance optimizations';
            case 'addSecurity': return 'Add security best practices';
            case 'includeCI': return 'Include CI/CD configuration';
            default: return key;
          }
        })
        .join(', ');

      const prompt = `
        Migrate the following ${sourceFramework} project to ${targetFramework}.
        
        Migration requirements:
        ${optionsText}

        Original project:
        ${projectContent}

        Please provide your response in the following JSON format:
        {
          "originalProject": "Brief summary of the original project",
          "migratedProject": "Brief summary of the migrated project",
          "summary": "Brief summary of the migration",
          "changes": ["change1", "change2", ...],
          "filesGenerated": 1,
          "warnings": ["warning1", "warning2", ...],
          "appliedSettings": ["setting1", "setting2", ...],
          "optimizations": ["optimization1", "optimization2", ...],
          "newFeatures": ["feature1", "feature2", ...],
          "migrationGuide": "Step-by-step migration guide",
          "migratedFiles": [
            {
              "name": "App.tsx",
              "content": "migrated file content",
              "type": "code",
              "path": "src/App.tsx"
            },
            {
              "name": "package.json",
              "content": "updated package.json",
              "type": "config",
              "path": "package.json"
            },
            {
              "name": "README.md",
              "content": "project documentation",
              "type": "documentation",
              "path": "README.md"
            }
          ]
        }

        Ensure the migrated project:
        1. Follows ${targetFramework} best practices and conventions
        2. Is production-ready and well-structured
        3. Includes proper error handling and logging
        4. Maintains the original functionality
        5. Uses modern language features and patterns
        ${options.generateTests ? '6. Includes comprehensive test coverage' : ''}
        ${options.createDocumentation ? '7. Has detailed documentation' : ''}
        ${options.optimizePerformance ? '8. Applies performance optimizations' : ''}
        ${options.addSecurity ? '9. Implements security best practices' : ''}
        ${options.includeCI ? '10. Includes CI/CD pipeline configuration' : ''}
        
        Migration approach:
        - Analyze the existing project structure and architecture
        - Identify reusable components and patterns
        - Convert code to ${targetFramework} syntax and patterns
        - Update dependencies and configuration files
        - Apply modern best practices and optimizations
        - Generate supporting files (tests, docs, CI/CD)
        - Provide clear migration guidance
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert software architect and project migration specialist. Migrate entire projects accurately while applying modern best practices and maintaining functionality.'
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
      console.error('Error migrating project:', error);
      throw new Error('Failed to migrate project with Azure GPT-4');
    }
  }
}

export const projectMigrationAIService = new ProjectMigrationAIService();