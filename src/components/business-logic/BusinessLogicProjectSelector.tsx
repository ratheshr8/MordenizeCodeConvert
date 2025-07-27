import React, { useState } from 'react';
import { Upload, Folder, File, X, Code, Settings, FileText, TestTube, Zap } from 'lucide-react';
import { BusinessLogicFile } from '../../types/businessLogic';

interface BusinessLogicProjectSelectorProps {
  selectedFiles: BusinessLogicFile[];
  onFilesChange: (files: BusinessLogicFile[]) => void;
}

export const BusinessLogicProjectSelector: React.FC<BusinessLogicProjectSelectorProps> = ({
  selectedFiles,
  onFilesChange
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFolderStructure(files);
  };

  const processFolderStructure = async (files: File[]) => {
    const newFiles: BusinessLogicFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isProjectFile(file)) {
        const content = await readFileContent(file);
        const fileType = detectFileType(file.name, file.webkitRelativePath, content);
        const language = detectLanguage(file.name);
        const relevance = assessBusinessLogicRelevance(file.name, file.webkitRelativePath, content, fileType);
        
        newFiles.push({
          id: `bl-file-${Date.now()}-${i}`,
          name: file.name,
          path: file.webkitRelativePath,
          type: fileType,
          content: content,
          language: language,
          size: file.size,
          businessLogicRelevance: relevance
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const processFiles = async (files: File[]) => {
    const newFiles: BusinessLogicFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isProjectFile(file)) {
        const content = await readFileContent(file);
        const fileType = detectFileType(file.name, file.name, content);
        const language = detectLanguage(file.name);
        const relevance = assessBusinessLogicRelevance(file.name, file.name, content, fileType);
        
        newFiles.push({
          id: `bl-file-${Date.now()}-${i}`,
          name: file.name,
          path: file.name,
          type: fileType,
          content: content,
          language: language,
          size: file.size,
          businessLogicRelevance: relevance
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const isProjectFile = (file: File): boolean => {
    const projectExtensions = [
      // Code files
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.hpp', 
      '.c', '.h', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.r',
      '.vue', '.svelte', '.dart',
      
      // Web files
      '.html', '.css', '.scss', '.sass', '.less',
      
      // Config files
      '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.env',
      '.config', '.conf', '.properties',
      
      // Project files
      '.sln', '.csproj', '.vbproj', '.fsproj', '.vcxproj',
      'pom.xml', 'build.gradle', 'package.json', 'composer.json',
      'Gemfile', 'requirements.txt', 'setup.py', 'Cargo.toml',
      'pubspec.yaml', 'go.mod',
      
      // Documentation
      '.md', '.rst', '.txt',
      
      // Database
      '.sql', '.db', '.sqlite'
    ];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionMatch = projectExtensions.includes(extension);
    const isSpecialFile = [
      'Dockerfile', 'docker-compose.yml', 'Makefile', 'CMakeLists.txt',
      'package.json', 'pom.xml', 'build.gradle', 'Gemfile', 'requirements.txt',
      'setup.py', 'Cargo.toml', 'pubspec.yaml', 'go.mod', 'go.sum'
    ].includes(file.name);
    
    return isExtensionMatch || isSpecialFile || file.type.startsWith('text/');
  };

  const detectFileType = (fileName: string, filePath: string, content: string): BusinessLogicFile['type'] => {
    const lowerName = fileName.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // Test files
    if (lowerPath.includes('/test/') || lowerPath.includes('/tests/') || 
        lowerName.includes('test') || lowerName.includes('spec') ||
        lowerContent.includes('test(') || lowerContent.includes('describe(')) {
      return 'test';
    }
    
    // Documentation files
    if (lowerName.includes('readme') || lowerName.includes('doc') || 
        lowerName.endsWith('.md') || lowerName.endsWith('.rst') || lowerName.endsWith('.txt')) {
      return 'documentation';
    }
    
    // Configuration files
    if (lowerName.includes('config') || lowerName.includes('.json') || 
        lowerName.includes('.yaml') || lowerName.includes('.yml') ||
        lowerName.includes('.xml') || lowerName.includes('.toml') ||
        lowerName.includes('.ini') || lowerName.includes('.env') ||
        lowerName.includes('package.json') || lowerName.includes('pom.xml') ||
        lowerName.includes('build.gradle') || lowerName.includes('gemfile') ||
        lowerName.includes('requirements.txt') || lowerName.includes('setup.py') ||
        lowerName.includes('cargo.toml') || lowerName.includes('pubspec.yaml') ||
        lowerName.includes('go.mod') || lowerName.includes('dockerfile')) {
      return 'config';
    }
    
    // Asset files
    if (lowerName.includes('.css') || lowerName.includes('.scss') || 
        lowerName.includes('.sass') || lowerName.includes('.less') ||
        lowerName.includes('.png') || lowerName.includes('.jpg') ||
        lowerName.includes('.svg') || lowerName.includes('.ico')) {
      return 'asset';
    }
    
    return 'code'; // Default to code
  };

  const detectLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'hpp': 'cpp',
      'c': 'c',
      'h': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'r': 'r',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'vue': 'vue',
      'svelte': 'svelte',
      'dart': 'dart',
      'sql': 'sql'
    };
    
    return languageMap[extension || ''] || 'text';
  };

  const assessBusinessLogicRelevance = (
    fileName: string, 
    filePath: string, 
    content: string, 
    fileType: BusinessLogicFile['type']
  ): 'high' | 'medium' | 'low' => {
    const lowerName = fileName.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // High relevance indicators
    const highRelevancePatterns = [
      // Business logic keywords
      'business', 'service', 'controller', 'model', 'entity', 'repository',
      'validation', 'rule', 'policy', 'workflow', 'process',
      // API and core functionality
      'api', 'endpoint', 'route', 'handler', 'middleware',
      // Database and data
      'schema', 'migration', 'seed', 'query',
      // Core application files
      'app', 'main', 'index', 'core'
    ];
    
    // Medium relevance indicators
    const mediumRelevancePatterns = [
      'component', 'util', 'helper', 'lib', 'common',
      'config', 'setting', 'constant', 'enum',
      'type', 'interface', 'dto', 'vo'
    ];
    
    // Low relevance indicators
    const lowRelevancePatterns = [
      'test', 'spec', 'mock', 'fixture',
      'style', 'css', 'scss', 'asset',
      'build', 'webpack', 'babel', 'eslint',
      'readme', 'doc', 'license', 'changelog'
    ];
    
    // Check file type first
    if (fileType === 'test' || fileType === 'asset' || fileType === 'documentation') {
      return 'low';
    }
    
    if (fileType === 'config') {
      return 'medium';
    }
    
    // Check for high relevance patterns
    for (const pattern of highRelevancePatterns) {
      if (lowerName.includes(pattern) || lowerPath.includes(pattern) || lowerContent.includes(pattern)) {
        return 'high';
      }
    }
    
    // Check for low relevance patterns
    for (const pattern of lowRelevancePatterns) {
      if (lowerName.includes(pattern) || lowerPath.includes(pattern)) {
        return 'low';
      }
    }
    
    // Check for medium relevance patterns
    for (const pattern of mediumRelevancePatterns) {
      if (lowerName.includes(pattern) || lowerPath.includes(pattern) || lowerContent.includes(pattern)) {
        return 'medium';
      }
    }
    
    // Default to medium for code files
    return fileType === 'code' ? 'medium' : 'low';
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (fileId: string) => {
    onFilesChange(selectedFiles.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: BusinessLogicFile['type']) => {
    switch (type) {
      case 'code':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'config':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'documentation':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'test':
        return <TestTube className="h-5 w-5 text-purple-500" />;
      case 'asset':
        return <File className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRelevanceIcon = (relevance: 'high' | 'medium' | 'low') => {
    switch (relevance) {
      case 'high':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRelevanceColor = (relevance: 'high' | 'medium' | 'low') => {
    switch (relevance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group files by relevance and type
  const groupedFiles = selectedFiles.reduce((acc, file) => {
    const key = `${file.businessLogicRelevance}-${file.type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {} as Record<string, BusinessLogicFile[]>);

  const relevanceOrder = ['high', 'medium', 'low'];
  const sortedGroups = Object.entries(groupedFiles).sort(([a], [b]) => {
    const [aRelevance] = a.split('-');
    const [bRelevance] = b.split('-');
    return relevanceOrder.indexOf(aRelevance) - relevanceOrder.indexOf(bRelevance);
  });

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Drop entire project folder here or click to browse
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload complete project folders for comprehensive business logic extraction
        </p>
        <input
          type="file"
          webkitdirectory=""
          onChange={handleFolderInput}
          className="hidden"
          id="bl-project-folder-input"
        />
        <label
          htmlFor="bl-project-folder-input"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200"
        >
          <Folder className="h-4 w-4 mr-2" />
          Select Complete Project
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Project Files ({selectedFiles.length})
          </h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <Zap className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-600">
                {selectedFiles.filter(f => f.businessLogicRelevance === 'high').length}
              </div>
              <div className="text-xs text-red-700">High Relevance</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">
                {selectedFiles.filter(f => f.businessLogicRelevance === 'medium').length}
              </div>
              <div className="text-xs text-yellow-700">Medium Relevance</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Zap className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-600">
                {selectedFiles.filter(f => f.businessLogicRelevance === 'low').length}
              </div>
              <div className="text-xs text-gray-700">Low Relevance</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Code className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">
                {selectedFiles.filter(f => f.type === 'code').length}
              </div>
              <div className="text-xs text-blue-700">Code Files</div>
            </div>
          </div>
          
          {/* File List by Relevance */}
          <div className="space-y-4">
            {sortedGroups.map(([groupKey, files]) => {
              const [relevance, type] = groupKey.split('-');
              return (
                <div key={groupKey}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide flex items-center">
                    {getRelevanceIcon(relevance as 'high' | 'medium' | 'low')}
                    <span className="ml-2">{relevance} Relevance - {type} Files ({files.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {files.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800 truncate">
                                {file.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getRelevanceColor(file.businessLogicRelevance)}`}>
                                {file.businessLogicRelevance}
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {file.language}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {file.path} • {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {files.length > 5 && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        ... and {files.length - 5} more files
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};