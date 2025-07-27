import { ProjectFramework } from '../types/projectMigration';

export const projectFrameworks: ProjectFramework[] = [
  // Legacy Frameworks (Source)
  {
    id: 'dotnet-framework',
    name: '.NET Framework 4.x',
    category: 'Legacy',
    icon: '🔷',
    description: 'Legacy .NET Framework applications',
    technologies: ['C#', 'VB.NET', 'ASP.NET Web Forms', 'WCF', 'WPF'],
    filePatterns: ['*.cs', '*.vb', '*.aspx', '*.ascx', '*.config', '*.sln', '*.csproj']
  },
  {
    id: 'java8',
    name: 'Java 8 Enterprise',
    category: 'Legacy',
    icon: '☕',
    description: 'Legacy Java 8 enterprise applications',
    technologies: ['Java 8', 'Spring 4.x', 'JSF', 'EJB', 'JSP'],
    filePatterns: ['*.java', '*.jsp', '*.xml', 'pom.xml', '*.properties']
  },
  {
    id: 'angular-js',
    name: 'AngularJS 1.x',
    category: 'Legacy',
    icon: '🅰️',
    description: 'Legacy AngularJS applications',
    technologies: ['AngularJS', 'JavaScript', 'Bower', 'Grunt/Gulp'],
    filePatterns: ['*.js', '*.html', '*.css', 'bower.json', 'Gruntfile.js']
  },
  {
    id: 'jquery-app',
    name: 'jQuery Applications',
    category: 'Legacy',
    icon: '💙',
    description: 'Traditional jQuery-based web applications',
    technologies: ['jQuery', 'JavaScript', 'HTML', 'CSS', 'PHP/ASP'],
    filePatterns: ['*.js', '*.html', '*.css', '*.php', '*.asp']
  },
  {
    id: 'rails3',
    name: 'Ruby on Rails 3.x',
    category: 'Legacy',
    icon: '💎',
    description: 'Legacy Ruby on Rails applications',
    technologies: ['Ruby', 'Rails 3.x', 'ERB', 'SASS'],
    filePatterns: ['*.rb', '*.erb', '*.scss', 'Gemfile', 'config.ru']
  },

  // Modern Web Frameworks (Target)
  {
    id: 'dotnet-core',
    name: '.NET 8 Core',
    category: 'Modern',
    icon: '🔷',
    description: 'Modern .NET Core/8 applications',
    technologies: ['C#', 'ASP.NET Core', 'Entity Framework Core', 'Blazor'],
    filePatterns: ['*.cs', '*.csproj', '*.json', '*.razor']
  },
  {
    id: 'java21',
    name: 'Java 21 LTS',
    category: 'Modern',
    icon: '☕',
    description: 'Modern Java 21 applications with Spring Boot',
    technologies: ['Java 21', 'Spring Boot 3.x', 'Spring Security', 'JPA'],
    filePatterns: ['*.java', 'pom.xml', '*.yml', '*.properties']
  },
  {
    id: 'react-app',
    name: 'React 18 + TypeScript',
    category: 'Web',
    icon: '⚛️',
    description: 'Modern React applications with TypeScript',
    technologies: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS'],
    filePatterns: ['*.tsx', '*.ts', '*.jsx', '*.js', 'package.json']
  },
  {
    id: 'vue3-app',
    name: 'Vue 3 + Composition API',
    category: 'Web',
    icon: '💚',
    description: 'Modern Vue 3 applications',
    technologies: ['Vue 3', 'TypeScript', 'Vite', 'Pinia'],
    filePatterns: ['*.vue', '*.ts', '*.js', 'package.json']
  },
  {
    id: 'angular-modern',
    name: 'Angular 17',
    category: 'Web',
    icon: '🅰️',
    description: 'Modern Angular applications',
    technologies: ['Angular 17', 'TypeScript', 'RxJS', 'Angular Material'],
    filePatterns: ['*.ts', '*.html', '*.scss', 'angular.json', 'package.json']
  },
  {
    id: 'nextjs-app',
    name: 'Next.js 14',
    category: 'Web',
    icon: '▲',
    description: 'Full-stack React applications with Next.js',
    technologies: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS'],
    filePatterns: ['*.tsx', '*.ts', '*.jsx', '*.js', 'next.config.js']
  },

  // Mobile Frameworks (Target)
  {
    id: 'react-native',
    name: 'React Native',
    category: 'Mobile',
    icon: '📱',
    description: 'Cross-platform mobile applications',
    technologies: ['React Native', 'TypeScript', 'Expo', 'React Navigation'],
    filePatterns: ['*.tsx', '*.ts', '*.jsx', '*.js', 'package.json']
  },
  {
    id: 'flutter-app',
    name: 'Flutter',
    category: 'Mobile',
    icon: '🎯',
    description: 'Cross-platform mobile applications with Flutter',
    technologies: ['Dart', 'Flutter', 'Material Design', 'Cupertino'],
    filePatterns: ['*.dart', 'pubspec.yaml', '*.yaml']
  },

  // Cloud Native (Target)
  {
    id: 'microservices-node',
    name: 'Node.js Microservices',
    category: 'Cloud',
    icon: '🟢',
    description: 'Cloud-native Node.js microservices',
    technologies: ['Node.js', 'Express', 'TypeScript', 'Docker', 'Kubernetes'],
    filePatterns: ['*.ts', '*.js', 'package.json', 'Dockerfile', '*.yaml']
  },
  {
    id: 'serverless-aws',
    name: 'AWS Serverless',
    category: 'Cloud',
    icon: '☁️',
    description: 'Serverless applications on AWS',
    technologies: ['AWS Lambda', 'API Gateway', 'DynamoDB', 'CloudFormation'],
    filePatterns: ['*.js', '*.ts', '*.json', '*.yaml', 'serverless.yml']
  }
];

export const getFrameworksByCategory = () => {
  const categories = projectFrameworks.reduce((acc, framework) => {
    if (!acc[framework.category]) {
      acc[framework.category] = [];
    }
    acc[framework.category].push(framework);
    return acc;
  }, {} as Record<string, ProjectFramework[]>);
  
  return categories;
};

export const getConvertibleFrameworks = (sourceFramework: string): string[] => {
  // Return all target frameworks (non-legacy) that our AI can migrate to
  return projectFrameworks
    .filter(framework => framework.category !== 'Legacy')
    .map(framework => framework.id);
};

export const getRecommendedTargets = (sourceFramework: string): string[] => {
  const recommendations: Record<string, string[]> = {
    // Legacy to Modern
    'dotnet-framework': ['dotnet-core', 'microservices-node', 'serverless-aws'],
    'java8': ['java21', 'microservices-node', 'serverless-aws'],
    'angular-js': ['angular-modern', 'react-app', 'vue3-app'],
    'jquery-app': ['react-app', 'vue3-app', 'nextjs-app'],
    'rails3': ['microservices-node', 'nextjs-app', 'serverless-aws'],
    
    // Modern to Cloud/Mobile
    'dotnet-core': ['microservices-node', 'serverless-aws'],
    'java21': ['microservices-node', 'serverless-aws'],
    'react-app': ['nextjs-app', 'react-native'],
    'vue3-app': ['nextjs-app', 'react-native'],
    'angular-modern': ['nextjs-app', 'react-native'],
  };
  
  return recommendations[sourceFramework] || [];
};