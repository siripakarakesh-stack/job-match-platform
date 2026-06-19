'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, X } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface CVUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export default function CVUploader({ onUpload, isLoading }: CVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messages, setMessages] = useState([
    'Reading your CV…',
    'Identifying your skills…',
    'Scanning job database…',
    'Calculating match scores…',
    'Almost ready...',
  ]);
  const [currentMessageIdx, setCurrentMessageIdx] = useState(0);

  // Cycling message effect
  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentMessageIdx((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading, messages]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(30);
      await onUpload(selectedFile);
      setUploadProgress(100);
      setSelectedFile(null);
    } catch (error) {
      setUploadProgress(0);
      throw error;
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-card p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-primary/40 bg-primary/5 hover:border-primary/60'
        }`}
      >
        <input {...getInputProps()} />
        <Cloud
          size={48}
          className="mx-auto mb-4 text-primary/60"
        />
        <p className="text-lg font-medium text-text-primary mb-1">
          Drag & drop your CV here
        </p>
        <p className="text-sm text-text-muted mb-4">or click to browse</p>
        <p className="text-xs text-text-muted">PDF files only — no size limit</p>
      </div>

      {/* Selected File Display */}
      {selectedFile && !isLoading && (
        <div className="mt-6 p-4 bg-surface border border-surface-border rounded-card flex items-center justify-between">
          <div className="flex-1">
            <p className="text-text-primary font-medium truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-text-muted">
              {formatBytes(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={removeFile}
            type="button"
            className="ml-4 p-2 hover:bg-surface/50 rounded-input transition-colors"
            aria-label="Remove file"
          >
            <X size={20} className="text-text-muted hover:text-text-primary" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isLoading && (
        <div className="mt-6 space-y-4">
          <div className="w-full bg-surface/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
              }}
            ></div>
          </div>
          <div className="text-center h-6">
            <p
              className="text-sm text-secondary font-medium transition-all duration-300 ease-in-out"
              key={currentMessageIdx}
              style={{
                animation: 'fadeIn 0.5s ease-in-out',
              }}
            >
              {messages[currentMessageIdx]}
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isLoading && (
        <button
          onClick={handleUpload}
          type="button"
          className="btn-primary mt-6"
        >
          Analysis & Match Jobs →
        </button>
      )}
    </div>
  );
}
