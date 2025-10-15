import { useQuery } from '@tanstack/react-query';

import { fetchImageAsFile } from '@/entities/remote-image/api/fetch-image';

export const remoteImageKeys = {
  all: ['remote-image'] as const,
  detail: (url: string) => [...remoteImageKeys.all, url] as const,
};

export function useRemoteImage(params: { url: string; filename: string }) {
  return useQuery({
    queryKey: remoteImageKeys.detail(params.url),
    queryFn: () => fetchImageAsFile(params),
    enabled: !!params.url,
  });
}
