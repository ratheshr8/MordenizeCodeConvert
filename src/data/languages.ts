import { Language } from '../types';

export const languages: Language[] = [
  // Legacy Languages (Source Only)
  { id: 'cobol', name: 'COBOL', category: 'Legacy', icon: '🏛️', extensions: ['.cob', '.cbl'] },
  { id: 'fortran', name: 'Fortran', category: 'Legacy', icon: '📊', extensions: ['.f', '.f90'] },
  { id: 'pascal', name: 'Pascal', category: 'Legacy', icon: '🔺', extensions: ['.pas'] },
  { id: 'vb6', name: 'Visual Basic', category: 'Legacy', icon: '🔷', extensions: ['.vb'] },
  { id: 'delphi', name: 'Delphi', category: 'Legacy', icon: '🔺', extensions: ['.pas', '.dpr'] },
  { id: 'powerbuilder', name: 'PowerBuilder', category: 'Legacy', icon: '⚡', extensions: ['.pbl', '.sra'] },
  { id: 'foxpro', name: 'FoxPro', category: 'Legacy', icon: '🦊', extensions: ['.prg', '.dbf'] },
  { id: 'clipper', name: 'Clipper', category: 'Legacy', icon: '📎', extensions: ['.prg'] },
  
  // Modern Languages (Primary Targets)
  { id: 'python', name: 'Python 3.12', category: 'Modern', icon: '🐍', extensions: ['.py'] },
  { id: 'java', name: 'Java 21 LTS', category: 'Modern', icon: '☕', extensions: ['.java'] },
  { id: 'csharp', name: 'C# 12 (.NET 8)', category: 'Modern', icon: '🔷', extensions: ['.cs'] },
  { id: 'go', name: 'Go 1.21', category: 'Modern', icon: '🐹', extensions: ['.go'] },
  { id: 'rust', name: 'Rust 1.75', category: 'Modern', icon: '🦀', extensions: ['.rs'] },
  { id: 'cpp', name: 'C++ 23', category: 'Modern', icon: '⚡', extensions: ['.cpp', '.hpp'] },
  
  // Web Languages (Full Stack Targets)
  { id: 'javascript', name: 'JavaScript ES2024', category: 'Web', icon: '🟨', extensions: ['.js', '.mjs'] },
  { id: 'typescript', name: 'TypeScript 5.3', category: 'Web', icon: '🔷', extensions: ['.ts', '.tsx'] },
  { id: 'nodejs', name: 'Node.js 20 LTS', category: 'Web', icon: '🟢', extensions: ['.js', '.ts'] },
  { id: 'react', name: 'React 18', category: 'Web', icon: '⚛️', extensions: ['.jsx', '.tsx'] },
  { id: 'vue', name: 'Vue.js 3', category: 'Web', icon: '💚', extensions: ['.vue'] },
  { id: 'angular', name: 'Angular 17', category: 'Web', icon: '🅰️', extensions: ['.ts', '.html'] },
  
  // Mobile Languages (Cross-Platform Targets)
  { id: 'swift', name: 'Swift 5.9 (iOS)', category: 'Mobile', icon: '🐦', extensions: ['.swift'] },
  { id: 'kotlin', name: 'Kotlin 1.9 (Android)', category: 'Mobile', icon: '🎯', extensions: ['.kt'] },
  { id: 'dart', name: 'Dart 3.2 (Flutter)', category: 'Mobile', icon: '🎯', extensions: ['.dart'] },
  { id: 'reactnative', name: 'React Native', category: 'Mobile', icon: '⚛️', extensions: ['.js', '.tsx'] },
  { id: 'xamarin', name: 'Xamarin (C#)', category: 'Mobile', icon: '🔷', extensions: ['.cs'] },
  
  // Cloud & DevOps (Infrastructure Targets)
  { id: 'terraform', name: 'Terraform HCL', category: 'Cloud', icon: '🏗️', extensions: ['.tf'] },
  { id: 'kubernetes', name: 'Kubernetes YAML', category: 'Cloud', icon: '☸️', extensions: ['.yaml', '.yml'] },
  { id: 'docker', name: 'Docker', category: 'Cloud', icon: '🐳', extensions: ['Dockerfile'] },
  { id: 'ansible', name: 'Ansible', category: 'Cloud', icon: '🔧', extensions: ['.yml', '.yaml'] },
  { id: 'cloudformation', name: 'AWS CloudFormation', category: 'Cloud', icon: '☁️', extensions: ['.json', '.yaml'] },
  
  // Data & Analytics (Specialized Targets)
  { id: 'r', name: 'R 4.3', category: 'Data', icon: '📈', extensions: ['.r', '.R'] },
  { id: 'sql', name: 'SQL (PostgreSQL/MySQL)', category: 'Data', icon: '🗄️', extensions: ['.sql'] },
  { id: 'scala', name: 'Scala 3', category: 'Data', icon: '🔺', extensions: ['.scala'] },
  { id: 'spark', name: 'Apache Spark (Scala/Python)', category: 'Data', icon: '⚡', extensions: ['.scala', '.py'] },
  { id: 'jupyter', name: 'Jupyter Notebook', category: 'Data', icon: '📓', extensions: ['.ipynb'] },
];

export const getLanguagesByCategory = () => {
  const categories = languages.reduce((acc, lang) => {
    if (!acc[lang.category]) {
      acc[lang.category] = [];
    }
    acc[lang.category].push(lang);
    return acc;
  }, {} as Record<string, Language[]>);
  
  return categories;
};

// Helper function to get recommended target languages for a given source language
export const getConvertibleLanguages = (sourceLanguage: string): string[] => {
  // Return all target languages (non-legacy) that our AI can convert to
  return languages
    .filter(lang => lang.category !== 'Legacy')
    .map(lang => lang.id);
};

export const getSourceLanguages = (): string[] => {
  // Return all languages that our AI can convert FROM
  // This includes both legacy languages (primary migration scenario) 
  // and modern languages (cross-platform conversions)
  return languages.map(lang => lang.id);
};

export const getRecommendedTargets = (sourceLanguage: string): string[] => {
  const recommendations: Record<string, string[]> = {
    // Legacy to Modern Enterprise
    'cobol': ['java', 'csharp', 'python'],
    'fortran': ['python', 'cpp', 'r'],
    'pascal': ['csharp', 'java', 'python'],
    'vb6': ['csharp', 'typescript', 'python'],
    'delphi': ['csharp', 'java', 'python'],
    'powerbuilder': ['csharp', 'angular', 'react'],
    'foxpro': ['csharp', 'python', 'nodejs'],
    'clipper': ['csharp', 'python', 'nodejs'],
    
    // Modern to Modern (cross-platform/framework)
    'python': ['java', 'csharp', 'javascript', 'typescript', 'go', 'rust'],
    'java': ['python', 'csharp', 'kotlin', 'scala', 'javascript'],
    'csharp': ['java', 'python', 'typescript', 'go'],
    'cpp': ['rust', 'go', 'python', 'java'],
    'javascript': ['typescript', 'python', 'java', 'csharp'],
    
    // Web Framework Conversions
    'react': ['vue', 'angular', 'typescript', 'nodejs'],
    'vue': ['react', 'angular', 'typescript', 'nodejs'],
    'angular': ['react', 'vue', 'typescript', 'nodejs'],
    
    // Mobile Conversions
    'swift': ['kotlin', 'dart', 'reactnative', 'xamarin'],
    'kotlin': ['swift', 'dart', 'reactnative', 'xamarin'],
    'dart': ['swift', 'kotlin', 'reactnative'],
    
    // Data & Analytics
    'r': ['python', 'scala', 'jupyter'],
    'sql': ['python', 'java', 'csharp', 'nodejs'],
  };
  
  return recommendations[sourceLanguage] || [];
}