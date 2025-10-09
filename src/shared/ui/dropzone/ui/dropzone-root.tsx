'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { type DropzoneState } from 'react-dropzone';

import type { FileWithMetadata } from '../types';

interface DropzoneContextValue extends DropzoneState {
  files: FileWithMetadata[];
  removeFile: (id: string) => void;
  clearFiles: () => void;
  isProcessing?: boolean;
}

const DropzoneContext = createContext<DropzoneContextValue | null>(null);

export function useDropzoneContext() {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('Dropzone compound components must be used within Dropzone.Root');
  }
  return context;
}

interface DropzoneRootProps extends DropzoneContextValue {
  children: ReactNode;
}

export function DropzoneRoot({ children, ...contextValue }: DropzoneRootProps) {
  return <DropzoneContext.Provider value={contextValue}>{children}</DropzoneContext.Provider>;
}
