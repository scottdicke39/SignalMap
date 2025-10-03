"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  onFilesProcessed: (data: any) => void;
  maxFiles?: number;
}

export default function FileUpload({ onFilesProcessed, maxFiles = 2 }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined
    }));
    
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });

      const response = await fetch('/api/upload/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process files');

      const result = await response.json();
      
      // Update file statuses
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })));
      
      // Pass extracted data to parent
      onFilesProcessed(result);
      
      // Clear files after successful processing
      setTimeout(() => setFiles([]), 2000);
    } catch (error: any) {
      console.error('Error processing files:', error);
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: error.message 
      })));
    } finally {
      setProcessing(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return '📄';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return '📝';
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) return '📃';
    return '📁';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-slate-600'}`} />
          </div>
          {isDragActive ? (
            <div>
              <p className="text-lg font-semibold text-blue-600">Drop files here...</p>
              <p className="text-sm text-blue-500">We'll extract the information for you</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Upload Job Descriptions, Playbooks, or Templates
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Supports: PDF, DOCX, TXT, MD (max {maxFiles} files)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileObj, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all"
            >
              <div className="text-3xl">{getFileIcon(fileObj.file.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {fileObj.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(fileObj.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              {/* Status Indicator */}
              {fileObj.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {fileObj.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              {fileObj.status === 'uploading' && (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              
              {/* Remove Button */}
              {fileObj.status !== 'uploading' && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={processing}
            className="rounded-xl"
          >
            Clear All
          </Button>
          <Button
            onClick={processFiles}
            disabled={processing || files.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Extract & Fill Form
              </>
            )}
          </Button>
        </div>
      )}

      {/* Processing Status */}
      {processing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="font-semibold text-blue-900">Processing documents...</p>
              <p className="text-sm text-blue-700">
                AI is extracting job details, competencies, and requirements
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

