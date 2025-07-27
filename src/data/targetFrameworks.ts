import { TargetFramework } from '../types/businessLogic';

export const targetFrameworks: TargetFramework[] = [
  // Web Frameworks
  {
    id: 'react-fullstack',
    name: 'React Full-Stack App',
    category: 'Web',
    icon: '⚛️',
    description: 'Complete React application with Node.js backend',
    technologies: ['React 18', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    features: ['SPA', 'REST API', 'Database', 'Authentication', 'Responsive Design'],
    complexity: 'Moderate'
  },
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    category: 'Web',
    icon: '▲',
    description: 'Full-stack Next.js application with modern features',
    technologies: ['Next.js 14', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    features: ['SSR/SSG', 'API Routes', 'Database ORM', 'Authentication', 'SEO Optimized'],
    complexity: 'Advanced'
  },
  {
    id: 'vue-nuxt',
    name: 'Vue.js + Nuxt Application',
    category: 'Web',
    icon: '💚',
    description: 'Modern Vue.js application with Nuxt framework',
    technologies: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    features: ['SSR', 'Auto-routing', 'State Management', 'Real-time Features'],
    complexity: 'Moderate'
  },
  {
    id: 'angular-app',
    name: 'Angular Enterprise App',
    category: 'Web',
    icon: '🅰️',
    description: 'Enterprise-grade Angular application',
    technologies: ['Angular 17', 'TypeScript', 'RxJS', 'Angular Material', 'NestJS'],
    features: ['Enterprise Architecture', 'Reactive Programming', 'Material Design', 'Microservices Ready'],
    complexity: 'Advanced'
  },

  // API Frameworks
  {
    id: 'nodejs-api',
    name: 'Node.js REST API',
    category: 'API',
    icon: '🟢',
    description: 'Scalable Node.js REST API with Express',
    technologies: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Redis', 'JWT'],
    features: ['REST API', 'Authentication', 'Rate Limiting', 'Caching', 'Documentation'],
    complexity: 'Simple'
  },
  {
    id: 'nestjs-api',
    name: 'NestJS Enterprise API',
    category: 'API',
    icon: '🐱',
    description: 'Enterprise NestJS API with microservices architecture',
    technologies: ['NestJS', 'TypeScript', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker'],
    features: ['GraphQL', 'Microservices', 'Dependency Injection', 'Testing', 'Swagger'],
    complexity: 'Advanced'
  },
  {
    id: 'fastapi-python',
    name: 'FastAPI Python',
    category: 'API',
    icon: '🐍',
    description: 'High-performance Python API with FastAPI',
    technologies: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Redis', 'Pydantic'],
    features: ['Auto Documentation', 'Type Safety', 'Async Support', 'High Performance'],
    complexity: 'Moderate'
  },
  {
    id: 'dotnet-api',
    name: '.NET Core API',
    category: 'API',
    icon: '🔷',
    description: 'Enterprise .NET Core Web API',
    technologies: ['.NET 8', 'C#', 'Entity Framework', 'SQL Server', 'Azure', 'JWT'],
    features: ['Enterprise Ready', 'Cloud Native', 'High Performance', 'Security'],
    complexity: 'Advanced'
  },

  // Mobile Frameworks
  {
    id: 'react-native',
    name: 'React Native App',
    category: 'Mobile',
    icon: '📱',
    description: 'Cross-platform mobile application',
    technologies: ['React Native', 'TypeScript', 'Expo', 'Firebase', 'React Navigation'],
    features: ['Cross Platform', 'Native Performance', 'Push Notifications', 'Offline Support'],
    complexity: 'Moderate'
  },
  {
    id: 'flutter-app',
    name: 'Flutter Application',
    category: 'Mobile',
    icon: '🎯',
    description: 'Cross-platform Flutter mobile app',
    technologies: ['Flutter', 'Dart', 'Firebase', 'Provider', 'Material Design'],
    features: ['Cross Platform', 'High Performance', 'Rich UI', 'State Management'],
    complexity: 'Moderate'
  },

  // Microservices
  {
    id: 'microservices-node',
    name: 'Node.js Microservices',
    category: 'Microservices',
    icon: '🔧',
    description: 'Microservices architecture with Node.js',
    technologies: ['Node.js', 'Express', 'Docker', 'Kubernetes', 'MongoDB', 'Redis'],
    features: ['Scalable', 'Container Ready', 'Service Discovery', 'Load Balancing'],
    complexity: 'Advanced'
  },
  {
    id: 'microservices-spring',
    name: 'Spring Boot Microservices',
    category: 'Microservices',
    icon: '🍃',
    description: 'Java microservices with Spring Boot',
    technologies: ['Java', 'Spring Boot', 'Spring Cloud', 'Docker', 'PostgreSQL'],
    features: ['Service Discovery', 'Circuit Breaker', 'Config Server', 'Gateway'],
    complexity: 'Advanced'
  },

  // Desktop Applications
  {
    id: 'electron-app',
    name: 'Electron Desktop App',
    category: 'Desktop',
    icon: '💻',
    description: 'Cross-platform desktop application',
    technologies: ['Electron', 'React', 'TypeScript', 'SQLite', 'Node.js'],
    features: ['Cross Platform', 'Native APIs', 'Auto Updates', 'System Integration'],
    complexity: 'Moderate'
  },
  {
    id: 'tauri-app',
    name: 'Tauri Desktop App',
    category: 'Desktop',
    icon: '🦀',
    description: 'Lightweight desktop app with Tauri',
    technologies: ['Tauri', 'Rust', 'React', 'TypeScript', 'SQLite'],
    features: ['Lightweight', 'Secure', 'Fast', 'Small Bundle Size'],
    complexity: 'Advanced'
  }
];

export const getFrameworksByCategory = () => {
  const categories = targetFrameworks.reduce((acc, framework) => {
    if (!acc[framework.category]) {
      acc[framework.category] = [];
    }
    acc[framework.category].push(framework);
    return acc;
  }, {} as Record<string, TargetFramework[]>);
  
  return categories;
};

export const getFrameworkById = (id: string): TargetFramework | undefined => {
  return targetFrameworks.find(framework => framework.id === id);
};

export const getRecommendedFrameworks = (businessLogicType: string): string[] => {
  const recommendations: Record<string, string[]> = {
    'web-application': ['react-fullstack', 'nextjs-app', 'vue-nuxt'],
    'api-service': ['nodejs-api', 'nestjs-api', 'fastapi-python'],
    'mobile-app': ['react-native', 'flutter-app'],
    'enterprise-system': ['angular-app', 'dotnet-api', 'nestjs-api'],
    'microservices': ['microservices-node', 'microservices-spring'],
    'desktop-app': ['electron-app', 'tauri-app'],
    'e-commerce': ['nextjs-app', 'react-fullstack'],
    'cms': ['nextjs-app', 'vue-nuxt'],
    'dashboard': ['react-fullstack', 'angular-app'],
    'default': ['react-fullstack', 'nodejs-api', 'nextjs-app']
  };
  
  return recommendations[businessLogicType] || recommendations['default'];
};