export interface BusinessLogicProject {
  id: string;
  name: string;
  description: string;
  files: BusinessLogicFile[];
  extractedLogic: string;
  targetFramework?: string;
  generationOptions: BusinessLogicGenerationOptions;
}

export interface BusinessLogicFile {
  id: string;
  name: string;
  path: string;
  type: 'code' | 'config' | 'documentation' | 'test' | 'asset';
  content: string;
  language: string;
  size: number;
  businessLogicRelevance: 'high' | 'medium' | 'low';
}

export interface BusinessLogicExtractionResult {
  extractedLogic: string;
  businessRules: string[];
  dataModels: string[];
  workflows: string[];
  integrations: string[];
  validationRules: string[];
  businessProcesses: string[];
  summary: string;
  confidence: number;
  recommendations: string[];
}

export interface BusinessLogicGenerationOptions {
  targetFramework: string;
  includeDatabase: boolean;
  includeAPI: boolean;
  includeFrontend: boolean;
  includeTests: boolean;
  includeDocumentation: boolean;
  includeDeployment: boolean;
  addAuthentication: boolean;
  addLogging: boolean;
  addErrorHandling: boolean;
  optimizePerformance: boolean;
  followBestPractices: boolean;
}

export interface BusinessLogicGenerationResult {
  projectName: string;
  description: string;
  summary: string;
  filesGenerated: number;
  warnings: string[];
  appliedOptions: string[];
  architecture: string[];
  technologies: string[];
  generatedFiles: {
    name: string;
    path: string;
    content: string;
    type: 'code' | 'config' | 'test' | 'documentation' | 'deployment';
    framework: string;
  }[];
  setupInstructions: string;
  deploymentGuide: string;
  nextSteps: string[];
}

export interface TargetFramework {
  id: string;
  name: string;
  category: 'Web' | 'Mobile' | 'Desktop' | 'API' | 'Microservices';
  icon: string;
  description: string;
  technologies: string[];
  features: string[];
  complexity: 'Simple' | 'Moderate' | 'Advanced';
}