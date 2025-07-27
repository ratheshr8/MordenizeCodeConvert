export interface DocumentationType {
  id: string;
  name: string;
  category: 'Technical' | 'User' | 'API' | 'Process';
  icon: string;
  extensions: string[];
  description: string;
}

export interface DocumentationOptions {
  includeCodeExamples: boolean;
  generateDiagrams: boolean;
  includeAPIReference: boolean;
  addInstallationGuide: boolean;
  generateTOC: boolean;
  includeChangelog: boolean;
}

export interface CodeFile {
  id: string;
  name: string;
  type: 'code' | 'config' | 'readme' | 'test';
  content: string;
  language: string;
  size?: number;
  path?: string;
}

export interface DocumentationAnalysisResult {
  codeStructure: string[];
  mainComponents: string[];
  apiEndpoints: string[];
  dependencies: string[];
  complexity: string;
  recommendations: string[];
}

export interface DocumentationResult {
  originalCode: string;
  generatedDocumentation: string;
  summary: string;
  sections: string[];
  filesGenerated: number;
  warnings: string[];
  appliedSettings: string[];
  features: string[];
  documentationFiles: {
    name: string;
    content: string;
    type: 'documentation' | 'diagram' | 'api' | 'guide';
  }[];
}