import { Box, Typography } from '@mui/material';

import type { Post } from '@/entities/post';
import { PostCard } from '@/widgets/post-card';

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh' }}>
        <Typography variant="h6" color="white">
          게시물이 없습니다
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh' }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
}
