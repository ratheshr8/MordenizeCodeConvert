import React, { useState } from 'react';
import { Upload, Code, X, FileText } from 'lucide-react';
import { CodeFile } from '../../types/documentation';

interface CodeFileSelectorProps {
  selectedFiles: CodeFile[];
  onFilesChange: (files: CodeFile[]) => void;
}

export const CodeFileSelector: React.FC<CodeFileSelectorProps> = ({
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
    const newFiles: CodeFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isCodeFile(file)) {
        const content = await readFileContent(file);
        const fileType = detectFileType(file.name, content);
        const language = detectLanguage(file.name);
        
        newFiles.push({
          id: `code-file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          content: content,
          language: language,
          size: file.size
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
    const newFiles: CodeFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isCodeFile(file)) {
        const content = await readFileContent(file);
        const fileType = detectFileType(file.name, content);
        const language = detectLanguage(file.name);
        
        newFiles.push({
          id: `code-file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          content: content,
          language: language,
          size: file.size,
          path: file.webkitRelativePath
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
      '.sql', '.dockerfile', '.gitignore', '.env'
    ];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return codeExtensions.includes(extension) || file.type.startsWith('text/') || file.name === 'Dockerfile';
  };

  const detectFileType = (fileName: string, content: string): CodeFile['type'] => {
    const lowerName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerName.includes('readme') || lowerName.includes('doc') || lowerName.endsWith('.md')) {
      return 'readme';
    }
    if (lowerName.includes('test') || lowerName.includes('spec') || lowerContent.includes('test(') || lowerContent.includes('describe(')) {
      return 'test';
    }
    if (lowerName.includes('config') || lowerName.includes('.json') || lowerName.includes('.yaml') || lowerName.includes('.yml')) {
      return 'config';
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

  const getFileTypeIcon = (type: CodeFile['type']) => {
    switch (type) {
      case 'code':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'config':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'readme':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'test':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type: CodeFile['type']) => {
    switch (type) {
      case 'code':
        return 'bg-blue-100 text-blue-800';
      case 'config':
        return 'bg-orange-100 text-orange-800';
      case 'readme':
        return 'bg-green-100 text-green-800';
      case 'test':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'javascript': 'bg-yellow-100 text-yellow-800',
      'typescript': 'bg-blue-100 text-blue-800',
      'python': 'bg-green-100 text-green-800',
      'java': 'bg-red-100 text-red-800',
      'csharp': 'bg-purple-100 text-purple-800',
      'go': 'bg-cyan-100 text-cyan-800',
      'rust': 'bg-orange-100 text-orange-800',
      'php': 'bg-indigo-100 text-indigo-800',
      'ruby': 'bg-red-100 text-red-800',
      'swift': 'bg-orange-100 text-orange-800',
      'kotlin': 'bg-purple-100 text-purple-800'
    };
    
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
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
          id="code-file-input"
        />
        <input
          type="file"
          webkitdirectory=""
          onChange={handleFolderInput}
          className="hidden"
          id="code-folder-input"
        />
        <label
          htmlFor="code-file-input"
          className="inline-flex items-center px-4 py-2 mr-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 cursor-pointer transition-colors duration-200"
        >
          Select Code Files
        </label>
        <label
          htmlFor="code-folder-input"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200"
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
                  {getFileTypeIcon(file.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {file.name}
                        {file.path && file.path !== file.name && (
                          <span className="text-xs text-gray-500 ml-2">({file.path})</span>
                        )}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>
                        {file.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getLanguageColor(file.language)}`}>
                        {file.language}
                      </span>
                    </div>
                    {file.size && (
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    )}
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
        </div>
      )}
    </div>
  );
};