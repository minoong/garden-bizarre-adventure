'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Avatar, Badge, Box, IconButton, Typography } from '@mui/material';
import Image from 'next/image';

import { formatDistanceToNow } from '@/shared/lib/utils';
import { useCommentState } from '@/features/comment/model';
import type { Comment } from '@/features/comment/model';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

export function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const { isLiked, showReplies, isReplying, toggleLike, toggleRepliesVisibility, toggleReplying } = useCommentState();

  const liked = isLiked(comment.id);
  const repliesVisible = showReplies(comment.id);
  const replying = isReplying(comment.id);

  const marginLeft = depth * 40;

  return (
    <Box sx={{ ml: `${marginLeft}px` }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          py: 2,
          px: 2,
        }}
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {comment.user.avatarUrl ? (
            <Image src={comment.user.avatarUrl} alt={comment.user.username} fill style={{ objectFit: 'cover' }} sizes="32px" />
          ) : (
            comment.user.username[0]?.toUpperCase()
          )}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 0.5 }}>
            <Typography component="span" variant="body2" sx={{ color: 'white', fontWeight: 600, mr: 1 }}>
              {comment.user.username}
            </Typography>
            <Typography component="span" variant="body2" sx={{ color: 'white' }}>
              {comment.content}
            </Typography>
          </Box>

          {comment.attachments.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {comment.attachments.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                    <video
                      src={url}
                      controls
                      autoPlay
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Image src={url} alt={`attachment-${index}`} fill style={{ objectFit: 'cover' }} />
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {formatDistanceToNow(comment.createdAt)}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                '&:hover': { color: 'white' },
              }}
              onClick={() => toggleReplying(comment.id)}
            >
              답글 달기
            </Typography>

            {comment.isEdited && (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                (수정됨)
              </Typography>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: 'white' },
                }}
                onClick={() => toggleRepliesVisibility(comment.id)}
              >
                {repliesVisible ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기`}
              </Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Badge
            badgeContent={comment.likesCount}
            color="error"
            max={999}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.475rem',
                height: '16px',
                minWidth: '16px',
                padding: '0 4px',
                bgcolor: 'rgba(255, 100, 100, 0.9)',
              },
            }}
          >
            <IconButton
              size="small"
              onClick={() => toggleLike(comment.id)}
              sx={{
                color: liked ? '#ff4444' : 'rgba(255, 255, 255, 0.5)',
                p: 0.5,
              }}
            >
              {liked ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {repliesVisible && comment.replies && comment.replies.length > 0 && (
        <Box>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </Box>
      )}

      {replying && (
        <Box
          sx={{
            ml: `${marginLeft + 48}px`,
            py: 1,
            px: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            답글 입력 기능은 추후 구현됩니다.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
