import { Container } from '@mui/material';

import { createClient } from '@/shared/lib/supabase/server';
import { getPosts } from '@/entities/post';
import { PostList } from '@/widgets/post-list';
import { LayoutProvider } from '@/app/providers/layout-provider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostsPage() {
  const supabase = await createClient();

  // SSR: 서버에서 데이터 패칭
  const posts = await getPosts(supabase, {
    limit: 20,
    isPublic: true,
  });

  return (
    <LayoutProvider>
      <Container maxWidth="sm" disableGutters sx={{ bgcolor: '#000000', py: 0, minHeight: '100vh' }}>
        <PostList posts={posts} />
      </Container>
    </LayoutProvider>
  );
}
