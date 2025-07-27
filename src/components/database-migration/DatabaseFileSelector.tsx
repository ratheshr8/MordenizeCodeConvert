import React, { useState } from 'react';
import { Upload, Database, X, FileText } from 'lucide-react';
import { DatabaseFile } from '../../types/database';

interface DatabaseFileSelectorProps {
  selectedFiles: DatabaseFile[];
  onFilesChange: (files: DatabaseFile[]) => void;
}

export const DatabaseFileSelector: React.FC<DatabaseFileSelectorProps> = ({
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
    const newFiles: DatabaseFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isDatabaseFile(file)) {
        const content = await readFileContent(file);
        const fileType = detectFileType(file.name, content);
        
        newFiles.push({
          id: `db-file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          content: content,
          size: file.size
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const isDatabaseFile = (file: File): boolean => {
    const dbExtensions = [
      '.sql', '.ddl', '.dml', '.psql', '.tsql', '.pls', '.pkb', '.cql', 
      '.db2', '.sqlite', '.json', '.js', '.redis'
    ];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return dbExtensions.includes(extension) || file.type.startsWith('text/');
  };

  const detectFileType = (fileName: string, content: string): DatabaseFile['type'] => {
    const lowerName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerName.includes('schema') || lowerContent.includes('create table') || lowerContent.includes('alter table')) {
      return 'schema';
    }
    if (lowerName.includes('procedure') || lowerName.includes('proc') || lowerContent.includes('create procedure')) {
      return 'procedure';
    }
    if (lowerName.includes('function') || lowerName.includes('func') || lowerContent.includes('create function')) {
      return 'function';
    }
    if (lowerName.includes('trigger') || lowerContent.includes('create trigger')) {
      return 'trigger';
    }
    if (lowerContent.includes('select') || lowerContent.includes('insert') || lowerContent.includes('update') || lowerContent.includes('delete')) {
      return 'query';
    }
    
    return 'query'; // Default to query
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

  const getFileTypeIcon = (type: DatabaseFile['type']) => {
    switch (type) {
      case 'schema':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'query':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'procedure':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'function':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'trigger':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type: DatabaseFile['type']) => {
    switch (type) {
      case 'schema':
        return 'bg-blue-100 text-blue-800';
      case 'query':
        return 'bg-green-100 text-green-800';
      case 'procedure':
        return 'bg-purple-100 text-purple-800';
      case 'function':
        return 'bg-orange-100 text-orange-800';
      case 'trigger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Drop database files here or click to browse
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Support for SQL files, schemas, queries, procedures, and functions
        </p>
        <input
          type="file"
          multiple
          accept=".sql,.ddl,.dml,.psql,.tsql,.pls,.pkb,.cql,.db2,.sqlite,.json,.js"
          onChange={handleFileInput}
          className="hidden"
          id="db-file-input"
        />
        <label
          htmlFor="db-file-input"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors duration-200"
        >
          Select Database Files
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Database Files ({selectedFiles.length})
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
                      <span className="font-medium text-gray-800">{file.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>
                        {file.type}
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