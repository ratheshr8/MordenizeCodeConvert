export interface ProjectFramework {
  id: string;
  name: string;
  category: 'Legacy' | 'Modern' | 'Web' | 'Mobile' | 'Desktop' | 'Cloud';
  icon: string;
  description: string;
  technologies: string[];
  filePatterns: string[];
}

export interface ProjectMigrationOptions {
  preserveArchitecture: boolean;
  modernizePatterns: boolean;
  updateDependencies: boolean;
  generateTests: boolean;
  createDocumentation: boolean;
  optimizePerformance: boolean;
  addSecurity: boolean;
  includeCI: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'code' | 'config' | 'asset' | 'documentation' | 'test';
  content: string;
  language: string;
  size: number;
  framework?: string;
}

export interface ProjectAnalysisResult {
  architecture: string[];
  frameworks: string[];
  dependencies: string[];
  patterns: string[];
  complexity: 'Low' | 'Medium' | 'High';
  migrationChallenges: string[];
  recommendations: string[];
  estimatedEffort: string;
}

export interface ProjectMigrationResult {
  originalProject: string;
  migratedProject: string;
  summary: string;
  changes: string[];
  filesGenerated: number;
  warnings: string[];
  appliedSettings: string[];
  optimizations: string[];
  newFeatures: string[];
  migrationGuide: string;
  migratedFiles: {
    name: string;
    content: string;
    type: 'code' | 'config' | 'test' | 'documentation' | 'ci';
    path: string;
  }[];
}