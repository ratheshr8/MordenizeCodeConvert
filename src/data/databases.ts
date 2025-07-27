import { DatabaseType } from '../types/database';

export const databases: DatabaseType[] = [
  // Legacy Databases (Source)
  { 
    id: 'oracle', 
    name: 'Oracle Database', 
    category: 'Legacy', 
    icon: '🔴', 
    extensions: ['.sql', '.pls', '.pkb'], 
    description: 'Enterprise database with PL/SQL support'
  },
  { 
    id: 'sqlserver', 
    name: 'SQL Server', 
    category: 'Legacy', 
    icon: '🟦', 
    extensions: ['.sql', '.tsql'], 
    description: 'Microsoft SQL Server with T-SQL'
  },
  { 
    id: 'db2', 
    name: 'IBM DB2', 
    category: 'Legacy', 
    icon: '🔵', 
    extensions: ['.sql', '.db2'], 
    description: 'IBM enterprise database system'
  },
  { 
    id: 'sybase', 
    name: 'Sybase ASE', 
    category: 'Legacy', 
    icon: '🟤', 
    extensions: ['.sql'], 
    description: 'Sybase Adaptive Server Enterprise'
  },
  { 
    id: 'informix', 
    name: 'IBM Informix', 
    category: 'Legacy', 
    icon: '🔶', 
    extensions: ['.sql'], 
    description: 'IBM Informix database system'
  },

  // Modern Relational Databases (Target)
  { 
    id: 'postgresql', 
    name: 'PostgreSQL 16', 
    category: 'Relational', 
    icon: '🐘', 
    extensions: ['.sql', '.psql'], 
    description: 'Advanced open-source relational database'
  },
  { 
    id: 'mysql', 
    name: 'MySQL 8.0', 
    category: 'Relational', 
    icon: '🐬', 
    extensions: ['.sql'], 
    description: 'Popular open-source database'
  },
  { 
    id: 'mariadb', 
    name: 'MariaDB 11', 
    category: 'Relational', 
    icon: '🦭', 
    extensions: ['.sql'], 
    description: 'MySQL-compatible database'
  },
  { 
    id: 'sqlite', 
    name: 'SQLite', 
    category: 'Relational', 
    icon: '🪶', 
    extensions: ['.sql', '.sqlite'], 
    description: 'Lightweight embedded database'
  },

  // Cloud Databases (Target)
  { 
    id: 'azure-sql', 
    name: 'Azure SQL Database', 
    category: 'Cloud', 
    icon: '☁️', 
    extensions: ['.sql'], 
    description: 'Microsoft Azure cloud database'
  },
  { 
    id: 'aws-rds', 
    name: 'AWS RDS', 
    category: 'Cloud', 
    icon: '🟠', 
    extensions: ['.sql'], 
    description: 'Amazon Relational Database Service'
  },
  { 
    id: 'gcp-sql', 
    name: 'Google Cloud SQL', 
    category: 'Cloud', 
    icon: '🔵', 
    extensions: ['.sql'], 
    description: 'Google Cloud managed database'
  },
  { 
    id: 'snowflake', 
    name: 'Snowflake', 
    category: 'Cloud', 
    icon: '❄️', 
    extensions: ['.sql'], 
    description: 'Cloud data warehouse platform'
  },

  // NoSQL Databases (Target)
  { 
    id: 'mongodb', 
    name: 'MongoDB', 
    category: 'NoSQL', 
    icon: '🍃', 
    extensions: ['.js', '.json'], 
    description: 'Document-oriented NoSQL database'
  },
  { 
    id: 'cassandra', 
    name: 'Apache Cassandra', 
    category: 'NoSQL', 
    icon: '🔗', 
    extensions: ['.cql'], 
    description: 'Distributed wide-column database'
  },
  { 
    id: 'dynamodb', 
    name: 'Amazon DynamoDB', 
    category: 'NoSQL', 
    icon: '⚡', 
    extensions: ['.json'], 
    description: 'AWS managed NoSQL database'
  },
  { 
    id: 'redis', 
    name: 'Redis', 
    category: 'NoSQL', 
    icon: '🔴', 
    extensions: ['.redis'], 
    description: 'In-memory data structure store'
  }
];

export const getDatabasesByCategory = () => {
  const categories = databases.reduce((acc, db) => {
    if (!acc[db.category]) {
      acc[db.category] = [];
    }
    acc[db.category].push(db);
    return acc;
  }, {} as Record<string, DatabaseType[]>);
  
  return categories;
};

export const getConvertibleDatabases = (sourceDatabase: string): string[] => {
  // Return all target databases (non-legacy) that our AI can convert to
  return databases
    .filter(db => db.category !== 'Legacy')
    .map(db => db.id);
};

export const getRecommendedTargets = (sourceDatabase: string): string[] => {
  const recommendations: Record<string, string[]> = {
    // Legacy to Modern/Cloud
    'oracle': ['postgresql', 'azure-sql', 'aws-rds'],
    'sqlserver': ['azure-sql', 'postgresql', 'mysql'],
    'db2': ['postgresql', 'azure-sql', 'snowflake'],
    'sybase': ['postgresql', 'mysql', 'azure-sql'],
    'informix': ['postgresql', 'mysql', 'aws-rds'],
    
    // Modern to Cloud/NoSQL
    'postgresql': ['azure-sql', 'aws-rds', 'gcp-sql'],
    'mysql': ['aws-rds', 'azure-sql', 'gcp-sql'],
    'mariadb': ['mysql', 'aws-rds', 'postgresql'],
    'sqlite': ['postgresql', 'mysql', 'mongodb'],
  };
  
  return recommendations[sourceDatabase] || [];
};