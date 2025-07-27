export interface CodeQualityMetric {
  name: string;
  value: number;
  maxValue: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

export interface CodeQualityIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line?: number;
  column?: number;
  suggestion: string;
  category: 'performance' | 'security' | 'maintainability' | 'reliability' | 'style';
}

export interface CodeQualityFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
}

export interface CodeQualityAnalysisResult {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: CodeQualityMetric[];
  issues: CodeQualityIssue[];
  summary: string;
  recommendations: string[];
  technicalDebt: {
    estimatedHours: number;
    priority: string[];
    categories: Record<string, number>;
  };
  codeSmells: string[];
  securityVulnerabilities: string[];
  performanceIssues: string[];
}

export interface CodeQualityOptions {
  checkPerformance: boolean;
  checkSecurity: boolean;
  checkMaintainability: boolean;
  checkReliability: boolean;
  checkStyle: boolean;
  includeMetrics: boolean;
  generateReport: boolean;
  suggestRefactoring: boolean;
}