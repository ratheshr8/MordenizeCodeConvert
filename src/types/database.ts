export interface DatabaseType {
  id: string;
  name: string;
  category: 'Relational' | 'NoSQL' | 'Cloud' | 'Legacy';
  icon: string;
  extensions: string[];
  description: string;
}

export interface DatabaseConversionOptions {
  preserveConstraints: boolean;
  generateIndexes: boolean;
  optimizeQueries: boolean;
  includeTestData: boolean;
  generateMigrationScripts: boolean;
}

export interface DatabaseFile {
  id: string;
  name: string;
  type: 'schema' | 'query' | 'procedure' | 'function' | 'trigger';
  content: string;
  size?: number;
}

export interface DatabaseAnalysisResult {
  schemaStructure: string[];
  queryPatterns: string[];
  complexityAnalysis: string[];
  migrationChallenges: string[];
  recommendations: string[];
}

export interface DatabaseConversionResult {
  originalSchema: string;
  convertedSchema: string;
  originalQueries: string;
  convertedQueries: string;
  summary: string;
  changes: string[];
  filesGenerated: number;
  warnings: string[];
  appliedSettings: string[];
  optimizations: string[];
  migrationScripts: string[];
  convertedFiles: {
    name: string;
    content: string;
    type: 'schema' | 'query' | 'migration' | 'documentation';
  }[];
}