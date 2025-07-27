import { CodeQualityAnalysisResult, CodeQualityOptions, CodeQualityFile } from '../types/codeQuality';

class CodeQualityAIService {
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
          '\nconst ',
          '\nlet ',
          '\nvar ',
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

  private async processChunkedAnalysis(chunks: string[], options: CodeQualityOptions): Promise<CodeQualityAnalysisResult> {
    const progressCallback = (current: number, total: number) => {
      window.dispatchEvent(new CustomEvent('chunkProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      }));
    };

    const chunkResults: CodeQualityAnalysisResult[] = [];
    
    console.log(`Processing ${chunks.length} chunks for code quality analysis...`);
    progressCallback(0, chunks.length);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
      progressCallback(i, chunks.length);
      
      const prompt = this.buildAnalysisPrompt(chunk, options, i + 1, chunks.length);

      try {
        const response = await this.makeRequest(
          [
            {
              role: 'system',
              content: 'You are an expert code quality analyst and software architect. Provide detailed, accurate analysis of code quality in JSON format.'
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
    
    return this.mergeAnalysisResults(chunkResults);
  }

  private buildAnalysisPrompt(code: string, options: CodeQualityOptions, chunkIndex: number, totalChunks: number): string {
    const analysisAreas = [];
    if (options.checkPerformance) analysisAreas.push('performance issues and optimization opportunities');
    if (options.checkSecurity) analysisAreas.push('security vulnerabilities and best practices');
    if (options.checkMaintainability) analysisAreas.push('maintainability and code organization');
    if (options.checkReliability) analysisAreas.push('reliability and error handling');
    if (options.checkStyle) analysisAreas.push('coding style and conventions');

    return `
      Analyze the following code chunk (${chunkIndex}/${totalChunks}) for quality issues and provide analysis focusing on: ${analysisAreas.join(', ')}.

      Code to analyze:
      ${code}

      Please provide your analysis in the following JSON format:
      {
        "overallScore": 85,
        "grade": "B",
        "metrics": [
          {
            "name": "Cyclomatic Complexity",
            "value": 8,
            "maxValue": 10,
            "status": "good",
            "description": "Measures code complexity"
          }
        ],
        "issues": [
          {
            "id": "issue-1",
            "type": "warning",
            "severity": "medium",
            "title": "Long function detected",
            "description": "Function exceeds recommended length",
            "file": "example.js",
            "line": 25,
            "suggestion": "Consider breaking this function into smaller functions",
            "category": "maintainability"
          }
        ],
        "summary": "Code quality analysis summary",
        "recommendations": ["recommendation1", "recommendation2"],
        "technicalDebt": {
          "estimatedHours": 4,
          "priority": ["High priority item"],
          "categories": {"maintainability": 2, "performance": 1}
        },
        "codeSmells": ["Long method", "Duplicate code"],
        "securityVulnerabilities": ["Potential XSS vulnerability"],
        "performanceIssues": ["Inefficient loop"]
      }

      Focus on:
      1. Code complexity and maintainability
      2. Performance bottlenecks and optimization opportunities
      3. Security vulnerabilities and best practices
      4. Error handling and reliability
      5. Code style and conventions
      6. Technical debt estimation
      7. Specific actionable recommendations
    `;
  }

  private mergeAnalysisResults(results: CodeQualityAnalysisResult[]): CodeQualityAnalysisResult {
    if (results.length === 1) {
      return results[0];
    }

    // Calculate overall score as weighted average
    const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0);
    const overallScore = Math.round(totalScore / results.length);

    // Determine grade based on overall score
    const grade = overallScore >= 90 ? 'A' : 
                 overallScore >= 80 ? 'B' : 
                 overallScore >= 70 ? 'C' : 
                 overallScore >= 60 ? 'D' : 'F';

    // Merge metrics (average values)
    const allMetrics = results.flatMap(r => r.metrics);
    const metricMap = new Map<string, { values: number[], maxValues: number[], descriptions: string[] }>();
    
    allMetrics.forEach(metric => {
      if (!metricMap.has(metric.name)) {
        metricMap.set(metric.name, { values: [], maxValues: [], descriptions: [] });
      }
      const entry = metricMap.get(metric.name)!;
      entry.values.push(metric.value);
      entry.maxValues.push(metric.maxValue);
      entry.descriptions.push(metric.description);
    });

    const mergedMetrics = Array.from(metricMap.entries()).map(([name, data]) => {
      const avgValue = Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length);
      const avgMaxValue = Math.round(data.maxValues.reduce((a, b) => a + b, 0) / data.maxValues.length);
      const status = avgValue >= avgMaxValue * 0.9 ? 'excellent' :
                    avgValue >= avgMaxValue * 0.7 ? 'good' :
                    avgValue >= avgMaxValue * 0.5 ? 'fair' : 'poor';
      
      return {
        name,
        value: avgValue,
        maxValue: avgMaxValue,
        status: status as 'excellent' | 'good' | 'fair' | 'poor',
        description: data.descriptions[0] // Use first description
      };
    });

    // Merge issues (deduplicate by title)
    const allIssues = results.flatMap(r => r.issues);
    const uniqueIssues = allIssues.filter((issue, index, self) => 
      index === self.findIndex(i => i.title === issue.title && i.file === issue.file)
    );

    // Merge other arrays and deduplicate
    const allRecommendations = results.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    const allCodeSmells = results.flatMap(r => r.codeSmells);
    const uniqueCodeSmells = [...new Set(allCodeSmells)];

    const allSecurityVulnerabilities = results.flatMap(r => r.securityVulnerabilities);
    const uniqueSecurityVulnerabilities = [...new Set(allSecurityVulnerabilities)];

    const allPerformanceIssues = results.flatMap(r => r.performanceIssues);
    const uniquePerformanceIssues = [...new Set(allPerformanceIssues)];

    // Merge technical debt
    const totalEstimatedHours = results.reduce((sum, r) => sum + r.technicalDebt.estimatedHours, 0);
    const allPriorities = results.flatMap(r => r.technicalDebt.priority);
    const uniquePriorities = [...new Set(allPriorities)];

    const mergedCategories: Record<string, number> = {};
    results.forEach(r => {
      Object.entries(r.technicalDebt.categories).forEach(([category, count]) => {
        mergedCategories[category] = (mergedCategories[category] || 0) + count;
      });
    });

    return {
      overallScore,
      grade,
      metrics: mergedMetrics,
      issues: uniqueIssues,
      summary: `Comprehensive code quality analysis across ${results.length} code sections. Overall quality score: ${overallScore}/100 (Grade ${grade}).`,
      recommendations: uniqueRecommendations,
      technicalDebt: {
        estimatedHours: totalEstimatedHours,
        priority: uniquePriorities,
        categories: mergedCategories
      },
      codeSmells: uniqueCodeSmells,
      securityVulnerabilities: uniqueSecurityVulnerabilities,
      performanceIssues: uniquePerformanceIssues
    };
  }

  async analyzeCodeQuality(files: CodeQualityFile[], options: CodeQualityOptions): Promise<CodeQualityAnalysisResult> {
    try {
      const codeContent = files.map(file => `// File: ${file.name} (${file.language})\n${file.content || ''}`).join('\n\n');
      
      if (codeContent.length > 6000) {
        console.log(`Large content detected (${codeContent.length} characters), using chunked analysis...`);
        const chunks = this.chunkContent(codeContent);
        return await this.processChunkedAnalysis(chunks, options);
      }
      
      const prompt = this.buildAnalysisPrompt(codeContent, options, 1, 1);

      const response = await this.makeRequest(
        [
          {
            role: 'system',
            content: 'You are an expert code quality analyst and software architect. Provide detailed, accurate analysis of code quality in JSON format.'
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
      console.error('Error analyzing code quality:', error);
      throw new Error('Failed to analyze code quality with Azure GPT-4');
    }
  }
}

export const codeQualityAIService = new CodeQualityAIService();