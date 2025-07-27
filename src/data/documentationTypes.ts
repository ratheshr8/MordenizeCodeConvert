import { DocumentationType } from '../types/documentation';

export const documentationTypes: DocumentationType[] = [
  // Technical Documentation
  { 
    id: 'readme', 
    name: 'README.md', 
    category: 'Technical', 
    icon: '📖', 
    extensions: ['.md'], 
    description: 'Project overview and setup instructions'
  },
  { 
    id: 'api-docs', 
    name: 'API Documentation', 
    category: 'API', 
    icon: '🔌', 
    extensions: ['.md', '.html'], 
    description: 'Comprehensive API reference documentation'
  },
  { 
    id: 'technical-spec', 
    name: 'Technical Specification', 
    category: 'Technical', 
    icon: '📋', 
    extensions: ['.md', '.pdf'], 
    description: 'Detailed technical architecture and design'
  },
  { 
    id: 'code-comments', 
    name: 'Inline Code Documentation', 
    category: 'Technical', 
    icon: '💬', 
    extensions: ['.js', '.py', '.java'], 
    description: 'Enhanced code comments and docstrings'
  },

  // User Documentation
  { 
    id: 'user-guide', 
    name: 'User Guide', 
    category: 'User', 
    icon: '👤', 
    extensions: ['.md', '.html'], 
    description: 'End-user instructions and tutorials'
  },
  { 
    id: 'installation-guide', 
    name: 'Installation Guide', 
    category: 'User', 
    icon: '⚙️', 
    extensions: ['.md'], 
    description: 'Step-by-step installation instructions'
  },
  { 
    id: 'troubleshooting', 
    name: 'Troubleshooting Guide', 
    category: 'User', 
    icon: '🔧', 
    extensions: ['.md'], 
    description: 'Common issues and solutions'
  },

  // API Documentation
  { 
    id: 'openapi', 
    name: 'OpenAPI/Swagger', 
    category: 'API', 
    icon: '🌐', 
    extensions: ['.yaml', '.json'], 
    description: 'OpenAPI specification for REST APIs'
  },
  { 
    id: 'postman', 
    name: 'Postman Collection', 
    category: 'API', 
    icon: '📮', 
    extensions: ['.json'], 
    description: 'Postman collection for API testing'
  },
  { 
    id: 'graphql-schema', 
    name: 'GraphQL Schema', 
    category: 'API', 
    icon: '🔗', 
    extensions: ['.graphql', '.gql'], 
    description: 'GraphQL schema documentation'
  },

  // Process Documentation
  { 
    id: 'deployment-guide', 
    name: 'Deployment Guide', 
    category: 'Process', 
    icon: '🚀', 
    extensions: ['.md'], 
    description: 'Deployment procedures and best practices'
  },
  { 
    id: 'contributing', 
    name: 'Contributing Guidelines', 
    category: 'Process', 
    icon: '🤝', 
    extensions: ['.md'], 
    description: 'Guidelines for project contributors'
  },
  { 
    id: 'changelog', 
    name: 'Changelog', 
    category: 'Process', 
    icon: '📝', 
    extensions: ['.md'], 
    description: 'Version history and release notes'
  }
];

export const getDocumentationTypesByCategory = () => {
  const categories = documentationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, DocumentationType[]>);
  
  return categories;
};

export const getRecommendedDocumentationTypes = (codeLanguage: string): string[] => {
  const recommendations: Record<string, string[]> = {
    // Web Technologies
    'javascript': ['readme', 'api-docs', 'user-guide', 'deployment-guide'],
    'typescript': ['readme', 'api-docs', 'technical-spec', 'contributing'],
    'react': ['readme', 'user-guide', 'api-docs', 'troubleshooting'],
    'nodejs': ['readme', 'api-docs', 'deployment-guide', 'installation-guide'],
    
    // Backend Languages
    'python': ['readme', 'api-docs', 'installation-guide', 'technical-spec'],
    'java': ['readme', 'api-docs', 'technical-spec', 'deployment-guide'],
    'csharp': ['readme', 'api-docs', 'technical-spec', 'user-guide'],
    'go': ['readme', 'api-docs', 'deployment-guide', 'installation-guide'],
    
    // Mobile
    'swift': ['readme', 'user-guide', 'installation-guide', 'troubleshooting'],
    'kotlin': ['readme', 'user-guide', 'installation-guide', 'api-docs'],
    
    // Legacy
    'cobol': ['technical-spec', 'user-guide', 'troubleshooting', 'readme'],
    'fortran': ['technical-spec', 'readme', 'user-guide', 'installation-guide'],
  };
  
  return recommendations[codeLanguage] || ['readme', 'api-docs', 'user-guide', 'technical-spec'];
};