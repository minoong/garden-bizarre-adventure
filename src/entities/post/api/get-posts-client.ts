'use client';

import { supabase } from '@/shared/lib/supabase/client';
import { simulateError } from '@/shared/lib/dev';

import { getPosts } from './get-posts';
import type { GetPostsOptions } from './get-posts';

/**
 * 클라이언트 사이드에서 게시물 목록 조회
 */
export async function getPostsClient(options: GetPostsOptions = {}) {
  await simulateError({ probability: 0.3, message: '게시물을 불러오는데 실패했습니다' });

  return getPosts(supabase, options);
}
