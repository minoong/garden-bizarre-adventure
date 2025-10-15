export async function blobToFile(blob: Blob, filename: string, mimeType?: string): Promise<File> {
  return new File([blob], filename, {
    type: mimeType || blob.type,
    lastModified: Date.now(),
  });
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}
