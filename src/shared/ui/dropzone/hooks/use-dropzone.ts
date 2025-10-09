import { useCallback, useState } from 'react';
import { useDropzone as useReactDropzone, type DropzoneOptions, type FileRejection } from 'react-dropzone';

import { processFiles } from '../lib/image-processor';
import type { FileWithMetadata } from '../types';

const DEFAULT_ACCEPT = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'],
  'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
};

interface UseDropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onFilesAccepted?: (files: FileWithMetadata[]) => void;
  onFilesRejected?: (rejections: FileRejection[]) => void;
  maxFiles?: number;
  maxSize?: number;
  enableOptimization?: boolean;
}

export function useDropzone({
  onFilesAccepted,
  onFilesRejected,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = DEFAULT_ACCEPT,
  enableOptimization = true,
  ...options
}: UseDropzoneProps = {}) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        setIsProcessing(true);

        // 파일 처리 (메타데이터 추출 + 최적화)
        const processedFiles = enableOptimization
          ? await processFiles(acceptedFiles)
          : acceptedFiles.map((file) => ({ id: crypto.randomUUID(), file, status: 'ready' as const }));

        setFiles((prev) => [...prev, ...processedFiles]);
        onFilesAccepted?.(processedFiles);
        setIsProcessing(false);
      }

      if (fileRejections.length > 0) {
        setRejectedFiles((prev) => [...prev, ...fileRejections]);
        onFilesRejected?.(fileRejections);
      }
    },
    [onFilesAccepted, onFilesRejected, enableOptimization],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setRejectedFiles([]);
  }, [files]);

  const dropzone = useReactDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    ...options,
  });

  return {
    ...dropzone,
    files,
    rejectedFiles,
    isProcessing,
    removeFile,
    clearFiles,
  };
}
