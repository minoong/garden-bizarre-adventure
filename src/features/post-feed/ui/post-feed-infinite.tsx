'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';

import type { Post } from '@/entities/post';
import { PostCard } from '@/widgets/post-card';
import { InView } from '@/shared/ui/intersection-observer/ui/in-view';
import { useInfinitePosts } from '@/features/post-feed/hooks/use-infinite-posts';

interface PostFeedInfiniteProps {
  initialPosts?: Post[];
  isPublic?: boolean;
  userId?: string;
}

export function PostFeedInfinite({ initialPosts, isPublic = true, userId }: PostFeedInfiniteProps) {
  const [showErrorToast, setShowErrorToast] = useState(false);
  const prevErrorRef = useRef<Error | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfinitePosts({
    initialData: initialPosts,
    isPublic,
    userId,
  });

  const posts = data?.pages.flatMap((page) => page) ?? [];

  useEffect(() => {
    if (error && error !== prevErrorRef.current && posts.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowErrorToast(true);
      prevErrorRef.current = error;
    } else if (!error && prevErrorRef.current) {
      setShowErrorToast(false);
      prevErrorRef.current = null;
    }
  }, [error, posts.length]);

  if (error && posts.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh' }}>
        <Typography variant="h6" color="error" gutterBottom>
          게시물을 불러오는 중 오류가 발생했습니다.
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, mb: 3 }}>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            window.location.reload();
          }}
          sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } }}
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh' }}>
        <Typography variant="h6" color="white">
          게시물이 없습니다.
        </Typography>
      </Box>
    );
  }

  const handleCloseToast = () => {
    setShowErrorToast(false);
  };

  const handleRetry = () => {
    setShowErrorToast(false);

    fetchNextPage();
  };

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh' }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <InView
          onChange={(inView: boolean) => {
            if (inView && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        >
          {(_inView: boolean, ref: (node?: Element | null) => void) => (
            <Box ref={ref} sx={{ py: 4, textAlign: 'center' }}>
              {isFetchingNextPage && <CircularProgress sx={{ color: 'white' }} size={32} />}
            </Box>
          )}
        </InView>
      )}

      {!hasNextPage && posts.length > 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
            모든 게시물을 확인했습니다.
          </Typography>
        </Box>
      )}

      <Snackbar open={showErrorToast} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={handleCloseToast}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              다시 시도
            </Button>
          }
        >
          {error?.message || '게시물을 불러오는데 실패했습니다.'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
