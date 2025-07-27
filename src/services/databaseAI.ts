import { DatabaseAnalysisResult, DatabaseConversionResult, DatabaseConversionOptions, DatabaseFile } from '../types/database';

class DatabaseAIService {
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

  async analyzeDatabase(files: DatabaseFile[], sourceDatabase: string): Promise<DatabaseAnalysisResult> {
    try {
      const schemaContent = files.map(file => `-- File: ${file.name} (${file.type})\n${file.content || ''}`).join('\n\n');
      
      const prompt = `
        Analyze the following ${sourceDatabase} database schema and queries:

        ${schemaContent}

        Please provide your analysis in the following JSON format:
        {
          "schemaStructure": ["table1 with columns...", "table2 with columns...", ...],
          "queryPatterns": ["pattern1", "pattern2", ...],
          "complexityAnalysis": ["complexity1", "complexity2", ...],
          "migrationChallenges": ["challenge1", "challenge2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...]
        }

        Focus on:
        1. Database schema structure (tables, columns, relationships)
        2. Query patterns and complexity
        3. Database-specific features used
        4. Potential migration challenges
        5. Recommendations for successful migration
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert database architect and migration specialist. Provide detailed, accurate analysis of database schemas and queries in JSON format.'
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
      console.error('Error analyzing database:', error);
      throw new Error('Failed to analyze database with Azure GPT-4');
    }
  }

  async convertDatabase(
    files: DatabaseFile[],
    sourceDatabase: string,
    targetDatabase: string,
    options: DatabaseConversionOptions
  ): Promise<DatabaseConversionResult> {
    try {
      const schemaContent = files.map(file => `-- File: ${file.name} (${file.type})\n${file.content || ''}`).join('\n\n');
      
      const optionsText = Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'preserveConstraints': return 'Preserve all constraints and relationships';
            case 'generateIndexes': return 'Generate optimized indexes';
            case 'optimizeQueries': return 'Optimize queries for target database';
            case 'includeTestData': return 'Include sample test data';
            case 'generateMigrationScripts': return 'Generate migration scripts';
            default: return key;
          }
        })
        .join(', ');

      const prompt = `
        Convert the following ${sourceDatabase} database schema and queries to ${targetDatabase}.
        
        Conversion requirements:
        ${optionsText}

        Original database content:
        ${schemaContent}

        Please provide your response in the following JSON format:
        {
          "originalSchema": "The original schema",
          "convertedSchema": "The converted schema with all improvements",
          "originalQueries": "The original queries",
          "convertedQueries": "The converted queries",
          "summary": "Brief summary of the conversion",
          "changes": ["change1", "change2", ...],
          "filesGenerated": 1,
          "warnings": ["warning1", "warning2", ...],
          "appliedSettings": ["setting1", "setting2", ...],
          "optimizations": ["optimization1", "optimization2", ...],
          "migrationScripts": ["script1", "script2", ...],
          "convertedFiles": [
            {
              "name": "schema.sql",
              "content": "converted schema content",
              "type": "schema"
            },
            {
              "name": "queries.sql", 
              "content": "converted queries content",
              "type": "query"
            },
            {
              "name": "migration.sql",
              "content": "migration script content", 
              "type": "migration"
            },
            {
              "name": "README.md",
              "content": "documentation content", 
              "type": "documentation"
            }
          ]
        }

        Ensure the converted database:
        1. Follows ${targetDatabase} best practices and syntax
        2. Is production-ready and well-structured
        3. Includes proper error handling
        4. Maintains data integrity and relationships
        ${options.optimizeQueries ? '5. Uses optimized query patterns for the target database' : '5. Uses standard query patterns'}
        ${options.generateIndexes ? '6. Includes appropriate indexes for performance' : ''}
        ${options.generateMigrationScripts ? '7. Includes step-by-step migration scripts' : ''}
        
        ${options.optimizeQueries ? `
        Apply these optimizations:
        - Use ${targetDatabase}-specific query optimization techniques
        - Optimize joins and subqueries
        - Apply indexing strategies
        - Use appropriate data types
        ` : `
        Optimization approach:
        - Keep queries simple and straightforward
        - Focus on correctness over performance optimization
        - Use standard SQL features when possible
        `}
        
        ${options.generateMigrationScripts ? `
        For migration scripts:
        - Create step-by-step migration procedures
        - Include data migration scripts
        - Add rollback procedures
        - Include validation scripts
        ` : ''}
      `;

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert database migration specialist proficient in multiple database systems. Convert database schemas and queries accurately while applying modern best practices.'
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
      console.error('Error converting database:', error);
      throw new Error('Failed to convert database with Azure GPT-4');
    }
  }
}

export const databaseAIService = new DatabaseAIService();