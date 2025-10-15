import { apiClient } from '@/shared/api/axios-instance';
import { blobToFile } from '@/shared/lib/utils/file-converter';

export async function fetchImageAsFile({ url, filename }: { url: string; filename: string }): Promise<File> {
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  const mimeType = response.headers['content-type'] || response.data.type;

  return blobToFile(response.data, filename, mimeType);
}

export async function fetchImagesAsFiles(params: { url: string; filename: string }[]): Promise<File[]> {
  const promises = params.map(fetchImageAsFile);
  return Promise.all(promises);
}
