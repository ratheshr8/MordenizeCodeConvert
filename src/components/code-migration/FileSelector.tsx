import React, { useState } from 'react';
import { Upload, File, Folder, X } from 'lucide-react';
import { FileItem } from '../../types';

interface FileSelectorProps {
  selectedFiles: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
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
    processFilesAndFolders(files);
  };

  const processFilesAndFolders = async (files: File[]) => {
    const newFiles: FileItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if it's a text file that we can read
      if (isTextFile(file)) {
        const content = await readFileContent(file);
        
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          size: file.size,
          path: file.webkitRelativePath || file.name,
          content: content
        });
      } else {
        // For non-text files, just add metadata
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          size: file.size,
          path: file.webkitRelativePath || file.name,
          content: `[Binary file: ${file.name}]`
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  };

  const isTextFile = (file: File): boolean => {
    const textExtensions = [
      '.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.hpp', 
      '.c', '.h', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.r',
      '.sql', '.html', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', 
      '.yml', '.md', '.rst', '.tex', '.sh', '.bat', '.ps1', '.vb', '.pas', '.f90',
      '.f', '.cob', '.cbl', '.prg', '.pl', '.pm', '.lua', '.dart', '.vue', '.svelte'
    ];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return textExtensions.includes(extension) || file.type.startsWith('text/');
  };

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFolderStructure(files);
  };

  const processFolderStructure = async (files: File[]) => {
    const newFiles: FileItem[] = [];
    const folderStructure = new Map<string, FileItem>();
    
    // First, create folder structure
    for (const file of files) {
      const pathParts = file.webkitRelativePath.split('/');
      
      // Create folder entries for each directory in the path
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i + 1).join('/');
        const folderName = pathParts[i];
        
        if (!folderStructure.has(folderPath)) {
          folderStructure.set(folderPath, {
            id: `folder-${Date.now()}-${folderPath}`,
            name: folderName,
            type: 'folder',
            path: folderPath,
            content: undefined
          });
        }
      }
    }
    
    // Add folders to the list
    newFiles.push(...Array.from(folderStructure.values()));
    
    // Then process files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (isTextFile(file)) {
        const content = await readFileContent(file);
        
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          size: file.size,
          path: file.webkitRelativePath,
          content: content
        });
      } else {
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          size: file.size,
          path: file.webkitRelativePath,
          content: `[Binary file: ${file.name}]`
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
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

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-brand-blue-500 bg-brand-blue-50'
            : 'border-gray-300 hover:border-brand-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Support for individual files and entire folder structures
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <input
          type="file"
          webkitdirectory=""
          onChange={handleFolderInput}
          className="hidden"
          id="folder-input"
        />
        <label
          htmlFor="file-input"
          className="inline-flex items-center px-4 py-2 mr-3 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-blue-600 hover:bg-brand-blue-700 cursor-pointer transition-colors duration-200"
        >
          Select Files
        </label>
        <label
          htmlFor="folder-input"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-orange-600 hover:bg-brand-orange-700 cursor-pointer transition-colors duration-200"
        >
          Select Folder
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-3">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  {file.type === 'file' ? (
                    <File className="h-5 w-5 text-brand-blue-500" />
                  ) : (
                    <Folder className="h-5 w-5 text-brand-orange-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-800">
                      {file.name}
                      {file.path !== file.name && (
                        <span className="text-xs text-gray-500 ml-2">({file.path})</span>
                      )}
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