import { Container } from '@mui/material';

import { createClient } from '@/shared/lib/supabase/server';
import { getPosts } from '@/entities/post';
import { PostFeedInfinite } from '@/features/post-feed';
import { LayoutProvider } from '@/app/providers/layout-provider';
import { POSTS_PER_PAGE } from '@/shared/config/pagination';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostsPage() {
  const supabase = await createClient();

  const initialPosts = await getPosts(supabase, {
    limit: POSTS_PER_PAGE,
    isPublic: true,
  });

  return (
    <LayoutProvider showFooter={false}>
      <Container maxWidth="sm" disableGutters sx={{ bgcolor: '#000000', py: 0, minHeight: '100vh' }}>
        <PostFeedInfinite initialPosts={initialPosts} isPublic />
      </Container>
    </LayoutProvider>
  );
}
