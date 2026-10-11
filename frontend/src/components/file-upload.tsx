'use client';

import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onUpload, accept = '.pdf', maxSizeMB = 50 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setSelectedFile(file);
    setProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploading(true);
    onUpload(selectedFile);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
            'border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-500/5',
            dragOver && 'border-emerald-500 bg-emerald-500/10'
          )}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-medium mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            {accept} files up to {maxSizeMB}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <File className="w-10 h-10 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {uploading && progress > 0 && (
              <div className="mt-4">
                <Progress value={progress} />
                <p className="text-slate-400 text-sm mt-2 text-center">
                  Uploading... {progress}%
                </p>
              </div>
            )}
          </div>
          {!uploading && (
            <button
              onClick={handleUpload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Upload File
            </button>
          )}
        </div>
      )}
    </div>
  );
}
