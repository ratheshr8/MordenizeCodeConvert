export interface Language {
  id: string;
  name: string;
  category: 'Legacy' | 'Modern' | 'Web' | 'Mobile' | 'Data' | 'Cloud';
  icon: string;
  extensions: string[];
}

export interface ConversionOptions {
  preserveComments: boolean;
  generateDocs: boolean;
  optimizeCode: boolean;
  includeTests: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  path: string;
  content?: string;
}

export interface AnalysisResult {
  languageFeatures: string[];
  programOverview: string;
  businessLogic: string[];
  dataProcessingFlow: string[];
  recommendations: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface FlowChartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  title: string;
  description: string;
  x: number;
  y: number;
}

export interface FlowChartConnection {
  from: string;
  to: string;
  label?: string;
}

export interface FlowChart {
  nodes: FlowChartNode[];
  connections: FlowChartConnection[];
}

export interface ConversionResult {
  originalCode: string;
  convertedCode: string;
  summary: string;
  changes: string[];
  filesGenerated: number;
  warnings: string[];
  appliedSettings: string[];
  optimizations: string[];
  documentationGenerated: boolean;
  convertedFiles: {
    name: string;
    content: string;
    type: 'code' | 'test' | 'documentation';
  }[];
}