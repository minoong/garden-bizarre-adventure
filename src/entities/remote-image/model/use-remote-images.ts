import { useQuery } from '@tanstack/react-query';

import { fetchImagesAsFiles } from '@/entities/remote-image/api/fetch-image';

import { remoteImageKeys } from './use-remote-image';

export function useRemoteImages(imageParams: { url: string; filename: string }[]) {
  return useQuery({
    queryKey: [...remoteImageKeys.all, 'multiple', imageParams],
    queryFn: () => fetchImagesAsFiles(imageParams),
    enabled: imageParams.length > 0,
  });
}
