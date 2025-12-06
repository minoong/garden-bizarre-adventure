'use client';

import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';

import { InView } from '@/shared/ui/intersection-observer';
import { fetchComments } from '@/features/comment/api';
import { organizeComments } from '@/features/comment/lib';
import { CommentStateProvider } from '@/features/comment/model';
import { CommentItem } from '@/features/comment/ui/comment-item';

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // useInfiniteQuery로 무한 스크롤 처리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => fetchComments({ pageParam, postId }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // 컴포넌트 언마운트 시 query cache 제거
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['comments', postId] });
    };
  }, [queryClient, postId]);

  // 모든 페이지의 댓글을 하나의 배열로 합치기
  const allComments = data?.pages.flatMap((page) => page.comments) ?? [];

  // 트리 구조로 댓글 정리
  const organizedComments = organizeComments(allComments);

  // 가상화 설정
  const virtualizer = useVirtualizer({
    count: organizedComments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // 예상 댓글 높이
    overscan: 5, // 화면 밖 렌더링할 항목 수
  });

  // 에러 처리
  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body2" color="rgba(255, 100, 100, 0.8)">
          댓글을 불러오는 중 오류가 발생했습니다.
        </Typography>
      </Box>
    );
  }

  // 초기 로딩
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: 'white' }} size={32} />
      </Box>
    );
  }

  // 댓글이 없는 경우
  if (allComments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </Typography>
      </Box>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <CommentStateProvider>
      <Box
        ref={parentRef}
        sx={{
          height: '100%',
          overflow: 'auto',
          pb: 2,
          contain: 'strict',
        }}
      >
        <Box
          sx={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${items[0].start}px)`,
              }}
            >
              {items.map((virtualItem) => (
                <Box key={virtualItem.key} data-index={virtualItem.index} ref={virtualizer.measureElement}>
                  <CommentItem comment={organizedComments[virtualItem.index]} />
                </Box>
              ))}
            </Box>
          )}

          {hasNextPage && (
            <Box
              sx={{
                position: 'absolute',
                top: `${virtualizer.getTotalSize()}px`,
                width: '100%',
              }}
            >
              <InView
                onChange={(inView: boolean) => {
                  if (inView && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                root={parentRef.current}
                rootMargin="200px"
              >
                {(_inView: boolean, ref: (node?: Element | null) => void) => (
                  <Box ref={ref} sx={{ py: 4, textAlign: 'center' }}>
                    {isFetchingNextPage && <CircularProgress sx={{ color: 'white' }} size={32} />}
                  </Box>
                )}
              </InView>
            </Box>
          )}

          {!hasNextPage && allComments.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                py: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                모든 댓글을 확인했습니다.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </CommentStateProvider>
  );
}
