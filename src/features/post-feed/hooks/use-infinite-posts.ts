'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { Post, GetPostsOptions } from '@/entities/post';
import { getPostsClient } from '@/entities/post/api/get-posts-client';
import { POSTS_PER_PAGE } from '@/shared/config/pagination';

interface UseInfinitePostsOptions extends Omit<GetPostsOptions, 'limit' | 'offset'> {
  initialData?: Post[];
}

export function useInfinitePosts(options: UseInfinitePostsOptions = {}) {
  const { initialData, ...restOptions } = options;

  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', restOptions],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const posts = await getPostsClient({
        ...restOptions,
        limit: POSTS_PER_PAGE,
        offset: pageParam,
      });
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < POSTS_PER_PAGE) {
        return undefined;
      }

      return allPages.length * POSTS_PER_PAGE;
    },
    initialPageParam: 0,
    ...(initialData && {
      initialData: {
        pages: [initialData],
        pageParams: [0],
      },
    }),
  });
}
