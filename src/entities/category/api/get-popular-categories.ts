import { supabase } from '@/shared/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

/**
 * 인기 카테고리 목록 조회
 * @param limit 조회할 카테고리 개수 (기본값: 20)
 * @returns 인기 카테고리 목록 (사용 횟수 내림차순)
 */
export async function getPopularCategories(limit = 20): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, usage_count')
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch popular categories:', error);
    return [];
  }

  return data || [];
}
