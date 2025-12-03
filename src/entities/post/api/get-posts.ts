import type { SupabaseClient } from '@supabase/supabase-js';

export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  date_from: string | null;
  date_to: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  bookmarks_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  post_images: Array<{
    id: string;
    image_url: string;
    thumbnail_url: string | null;
    width: number | null;
    height: number | null;
    latitude: number | null;
    longitude: number | null;
    taken_at: string | null;
    display_order: number;
  }>;
  post_categories: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
}

export interface GetPostsOptions {
  limit?: number;
  offset?: number;
  userId?: string;
  isPublic?: boolean;
}

/**
 * 게시물 목록 조회 (SSR/CSR 공통)
 */
export async function getPosts(supabase: SupabaseClient, options: GetPostsOptions = {}) {
  const { limit = 20, offset = 0, userId, isPublic = true } = options;

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      title,
      content,
      location_name,
      latitude,
      longitude,
      date_from,
      date_to,
      likes_count,
      comments_count,
      views_count,
      bookmarks_count,
      is_public,
      created_at,
      updated_at,
      profiles!user_id (
        username,
        display_name,
        avatar_url
      ),
      post_images (
        id,
        image_url,
        thumbnail_url,
        width,
        height,
        latitude,
        longitude,
        taken_at,
        display_order
      ),
      post_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `,
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // 필터링
  if (isPublic !== undefined) {
    query = query.eq('is_public', isPublic);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []) as unknown as Post[];
}

/**
 * 단일 게시물 조회
 */
export async function getPost(supabase: SupabaseClient, postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      title,
      content,
      location_name,
      latitude,
      longitude,
      date_from,
      date_to,
      likes_count,
      comments_count,
      views_count,
      bookmarks_count,
      is_public,
      created_at,
      updated_at,
      profiles!user_id (
        username,
        display_name,
        avatar_url
      ),
      post_images (
        id,
        image_url,
        thumbnail_url,
        width,
        height,
        latitude,
        longitude,
        taken_at,
        display_order
      ),
      post_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `,
    )
    .eq('id', postId)
    .single();

  if (error) throw error;

  return data as unknown as Post;
}
