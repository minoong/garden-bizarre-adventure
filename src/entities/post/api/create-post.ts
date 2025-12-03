import { supabase } from '@/shared/lib/supabase/client';

export interface CreatePostInput {
  title?: string;
  content?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  dateFrom: Date;
  dateTo: Date;
  isPublic: boolean;
}

export interface CreatePostImageInput {
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  takenAt?: Date;
  displayOrder: number;
}

/**
 * 게시물 생성
 */
export async function createPost(input: CreatePostInput) {
  // 현재 인증된 사용자 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증되지 않은 사용자입니다. 로그인이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      location_name: input.locationName,
      latitude: input.latitude,
      longitude: input.longitude,
      date_from: input.dateFrom.toISOString().split('T')[0], // YYYY-MM-DD
      date_to: input.dateTo.toISOString().split('T')[0], // YYYY-MM-DD
      is_public: input.isPublic,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 게시물 이미지 생성 (배치)
 */
export async function createPostImages(postId: string, images: CreatePostImageInput[]) {
  const { data, error } = await supabase
    .from('post_images')
    .insert(
      images.map((img) => ({
        post_id: postId,
        image_url: img.imageUrl,
        thumbnail_url: img.thumbnailUrl,
        width: img.width,
        height: img.height,
        file_size: img.fileSize,
        mime_type: img.mimeType,
        latitude: img.latitude,
        longitude: img.longitude,
        taken_at: img.takenAt?.toISOString(),
        display_order: img.displayOrder,
      })),
    )
    .select();

  if (error) throw error;
  return data;
}

/**
 * 카테고리 생성 또는 조회
 */
export async function getOrCreateCategory(name: string) {
  // 기존 카테고리 조회
  const { data: existing } = await supabase.from('categories').select('id').eq('name', name).maybeSingle();

  if (existing) return existing.id;

  // 새 카테고리 생성
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * 게시물-카테고리 연결
 */
export async function linkPostCategories(postId: string, categoryIds: string[]) {
  const { data, error } = await supabase
    .from('post_categories')
    .insert(categoryIds.map((categoryId) => ({ post_id: postId, category_id: categoryId })))
    .select();

  if (error) throw error;
  return data;
}

/**
 * 태그 생성 또는 조회
 */
export async function getOrCreateTag(name: string) {
  // 기존 태그 조회
  const { data: existing } = await supabase.from('tags').select('id').eq('name', name).maybeSingle();

  if (existing) return existing.id;

  // 새 태그 생성
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const { data, error } = await supabase
    .from('tags')
    .insert({
      name,
      slug,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * 게시물-태그 연결
 */
export async function linkPostTags(postId: string, tagIds: string[]) {
  const { data, error } = await supabase
    .from('post_tags')
    .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))
    .select();

  if (error) throw error;
  return data;
}
