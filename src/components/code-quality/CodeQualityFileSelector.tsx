import React, { useState } from 'react';
import { Upload, Code, X, FileText, BarChart3 } from 'lucide-react';
import { CodeQualityFile } from '../../types/codeQuality';

interface CodeQualityFileSelectorProps {
  selectedFiles: CodeQualityFile[];
  onFilesChange: (files: CodeQualityFile[]) => void;
}

export const CodeQualityFileSelector: React.FC<CodeQualityFileSelectorProps> = ({
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const newFiles: CodeQualityFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isCodeFile(file)) {
        const content = await readFileContent(file);
        const language = detectLanguage(file.name);
        const linesOfCode = content.split('\n').length;
        
        newFiles.push({
          id: `quality-file-${Date.now()}-${i}`,
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content: content,
          language: language,
          size: file.size,
          linesOfCode: linesOfCode,
          complexity: estimateComplexity(content),
          maintainabilityIndex: estimateMaintainability(content, linesOfCode)
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFolderStructure(files);
  };

  const processFolderStructure = async (files: File[]) => {
    const newFiles: CodeQualityFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isCodeFile(file)) {
        const content = await readFileContent(file);
        const language = detectLanguage(file.name);
        const linesOfCode = content.split('\n').length;
        
        newFiles.push({
          id: `quality-file-${Date.now()}-${i}`,
          name: file.name,
          path: file.webkitRelativePath,
          content: content,
          language: language,
          size: file.size,
          linesOfCode: linesOfCode,
          complexity: estimateComplexity(content),
          maintainabilityIndex: estimateMaintainability(content, linesOfCode)
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const isCodeFile = (file: File): boolean => {
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.hpp', 
      '.c', '.h', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.r',
      '.html', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', 
      '.yml', '.md', '.rst', '.tex', '.sh', '.bat', '.ps1', '.vb', '.pas', '.f90',
      '.f', '.cob', '.cbl', '.prg', '.pl', '.pm', '.lua', '.dart', '.vue', '.svelte',
      '.sql'
    ];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return codeExtensions.includes(extension) || file.type.startsWith('text/');
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
      'sql': 'sql',
      'sh': 'bash',
      'bat': 'batch',
      'ps1': 'powershell',
      'vb': 'vb',
      'pas': 'pascal',
      'f90': 'fortran',
      'f': 'fortran',
      'cob': 'cobol',
      'cbl': 'cobol',
      'prg': 'clipper',
      'pl': 'perl',
      'lua': 'lua',
      'dart': 'dart',
      'vue': 'vue',
      'svelte': 'svelte'
    };
    
    return languageMap[extension || ''] || 'text';
  };

  const estimateComplexity = (content: string): number => {
    // Simple complexity estimation based on control flow keywords
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try',
      'forEach', 'map', 'filter', 'reduce', '&&', '\\|\\|', '\\?'
    ];
    
    let complexity = 1; // Base complexity
    complexityKeywords.forEach(keyword => {
      const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return Math.min(complexity, 50); // Cap at 50
  };

  const estimateMaintainability = (content: string, linesOfCode: number): number => {
    // Simple maintainability estimation (0-100 scale)
    let score = 100;
    
    // Penalize for long files
    if (linesOfCode > 500) score -= 20;
    else if (linesOfCode > 200) score -= 10;
    
    // Penalize for long lines
    const longLines = content.split('\n').filter(line => line.length > 120).length;
    score -= Math.min(longLines * 2, 30);
    
    // Reward for comments
    const commentLines = content.split('\n').filter(line => 
      line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('#')
    ).length;
    const commentRatio = commentLines / linesOfCode;
    if (commentRatio > 0.1) score += 10;
    
    return Math.max(Math.min(score, 100), 0);
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

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 10) return 'text-green-600 bg-green-100';
    if (complexity <= 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMaintainabilityColor = (index: number) => {
    if (index >= 80) return 'text-green-600 bg-green-100';
    if (index >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

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
          Drop code files here or click to browse
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Support for individual files and entire folder structures
        </p>
        <input
          type="file"
          multiple
          accept=".js,.ts,.jsx,.tsx,.py,.java,.cs,.cpp,.c,.go,.rs,.php,.rb,.swift,.kt,.scala,.r,.html,.css,.scss,.json,.xml,.yaml,.yml,.md,.sql,.sh,.bat,.ps1,.vb,.pas,.f90,.f,.cob,.cbl,.prg,.pl,.lua,.dart,.vue,.svelte"
          onChange={handleFileInput}
          className="hidden"
          id="quality-file-input"
        />
        <input
          type="file"
          webkitdirectory=""
          onChange={handleFolderInput}
          className="hidden"
          id="quality-folder-input"
        />
        <label
          htmlFor="quality-file-input"
          className="inline-flex items-center px-4 py-2 mr-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200"
        >
          Select Code Files
        </label>
        <label
          htmlFor="quality-folder-input"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors duration-200"
        >
          Select Folder
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Code Files ({selectedFiles.length})
          </h3>
          <div className="space-y-3">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {file.name}
                        {file.path !== file.name && (
                          <span className="text-xs text-gray-500 ml-2">({file.path})</span>
                        )}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {file.language}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.linesOfCode} lines</span>
                      <span className={`px-2 py-1 rounded-full ${getComplexityColor(file.complexity)}`}>
                        Complexity: {file.complexity}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getMaintainabilityColor(file.maintainabilityIndex)}`}>
                        Maintainability: {file.maintainabilityIndex}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">
                {selectedFiles.reduce((sum, file) => sum + file.linesOfCode, 0)}
              </div>
              <div className="text-xs text-blue-700">Total Lines</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <FileText className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">
                {Math.round(selectedFiles.reduce((sum, file) => sum + file.complexity, 0) / selectedFiles.length)}
              </div>
              <div className="text-xs text-purple-700">Avg Complexity</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <Code className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">
                {Math.round(selectedFiles.reduce((sum, file) => sum + file.maintainabilityIndex, 0) / selectedFiles.length)}%
              </div>
              <div className="text-xs text-green-700">Avg Maintainability</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <FileText className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">
                {new Set(selectedFiles.map(f => f.language)).size}
              </div>
              <div className="text-xs text-orange-700">Languages</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};