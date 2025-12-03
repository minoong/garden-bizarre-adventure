import { supabase } from '@/shared/lib/supabase/client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

/**
 * 인기 태그 목록 조회 (인스타그램 스타일)
 * @param limit 조회할 태그 개수 (기본값: 20)
 * @returns 인기 태그 목록 (사용 횟수 내림차순)
 */
export async function getPopularTags(limit = 20): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, usage_count')
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch popular tags:', error);
    return [];
  }

  return data || [];
}
