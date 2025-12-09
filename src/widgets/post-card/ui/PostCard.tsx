'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Avatar, Box, Card, CardActions, CardContent, CardHeader, Chip, IconButton, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { Post } from '@/entities/post';
import { CommentSheet } from '@/features/comment';
import { LocationSheet } from '@/features/location';
import { formatCountWithComma } from '@/shared/lib/utils';
import { SwiperPaginationStyles } from '@/shared/ui/swiper-pagination-styles';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const images = post.post_images.sort((a, b) => a.display_order - b.display_order);
  const categories = post.post_categories.map((pc) => pc.categories).filter((c): c is NonNullable<typeof c> => c !== null);

  useEffect(() => {
    if (!post.content || isContentExpanded) return;

    const checkOverflow = () => {
      const element = contentRef.current;
      if (!element) return;

      if (post.content && post.content.includes('\n')) {
        setShouldShowMore(true);
        return;
      }

      const isOverflowing = element.scrollHeight > element.clientHeight;
      setShouldShowMore(isOverflowing);
    };

    checkOverflow();

    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [post.content, isContentExpanded]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: API 호출
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: API 호출
  };

  const handleCommentClick = () => {
    setIsCommentSheetOpen(true);
  };

  const handleLocationClick = () => {
    setIsLocationSheetOpen(true);
  };

  const hasLocation = (post.latitude !== null && post.longitude !== null) || post.post_images.some((img) => img.latitude !== null && img.longitude !== null);

  return (
    <Card
      sx={{
        maxWidth: 614,
        mx: 'auto',
        mb: 2,
        boxShadow: 'none',
        borderRadius: 0,
        position: 'relative',
        zIndex: 1,
        bgcolor: '#000000',
        color: 'white',
      }}
    >
      {/* Header */}
      <CardHeader
        avatar={
          <Avatar src={post.profiles?.avatar_url || undefined} alt={post.profiles?.display_name || post.profiles?.username}>
            {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" sx={{ color: 'white' }}>
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography variant="subtitle2" fontWeight="bold">
            {post.profiles?.display_name || post.profiles?.username || 'Unknown'}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={0.5} alignItems="center">
            {post.location_name && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocationOnIcon sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {post.location_name}
                </Typography>
              </Box>
            )}
          </Stack>
        }
        sx={{ pb: 2 }}
      />

      {/* Images - Swiper */}
      {images.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <SwiperPaginationStyles className="post-card-swiper" />
          <Box sx={{ aspectRatio: '1/1', bgcolor: 'black', position: 'relative' }}>
            {images.length > 1 && (
              <Chip
                label={`${currentSlide}/${images.length}`}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '10px',
                  height: '22px',
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                }}
              />
            )}
            <Swiper
              className="post-card-swiper"
              modules={[Pagination]}
              pagination={{ clickable: true }}
              onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
              style={{ width: '100%', height: '100%' }}
            >
              {images.map((image) => (
                <SwiperSlide key={image.id}>
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <Image src={image.image_url} alt={post.title || 'Post image'} fill style={{ objectFit: 'contain' }} sizes="614px" priority />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      )}

      {/* Actions */}
      <CardActions disableSpacing sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleLike} sx={{ p: 0.275, color: 'white' }}>
            {isLiked ? <FavoriteIcon sx={{ color: 'error.main' }} /> : <FavoriteBorderIcon />}
          </IconButton>
          {formatCountWithComma(post.likes_count) && (
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }} onClick={handleLike}>
              {formatCountWithComma(post.likes_count)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <IconButton onClick={handleCommentClick} sx={{ p: 0.275, color: 'white' }}>
            <CommentIcon />
          </IconButton>
          {formatCountWithComma(post.comments_count) && (
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }} onClick={handleCommentClick}>
              {formatCountWithComma(post.comments_count)}
            </Typography>
          )}
        </Box>
        {hasLocation && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <IconButton onClick={handleLocationClick} sx={{ p: 0.275, color: 'white' }}>
              <LocationOnIcon />
            </IconButton>
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleBookmark} sx={{ p: 1, color: 'white' }}>
          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </CardActions>

      {/* Content */}
      <CardContent sx={{ pt: 0, pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Title and Content */}
        <Box sx={{ mb: 0.5 }}>
          {/* Title */}
          {post.title && (
            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {post.title}
            </Typography>
          )}

          {/* Content */}
          {post.content && (
            <Box>
              <Typography
                ref={contentRef}
                variant="body2"
                component="div"
                sx={{
                  display: isContentExpanded ? 'block' : '-webkit-box',
                  WebkitLineClamp: isContentExpanded ? 'unset' : 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: isContentExpanded ? 'clip' : 'ellipsis',
                  whiteSpace: isContentExpanded ? 'pre-wrap' : 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {post.content}
              </Typography>
              {shouldShowMore && !isContentExpanded && (
                <Box
                  component="span"
                  onClick={() => setIsContentExpanded(true)}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  더 보기
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Categories */}
        {categories.length > 0 && (
          <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
            {categories.map((c) => `#${c.name}`).join(' ')}
          </Typography>
        )}

        {/* Date */}
        <Typography variant="caption" display="block" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {dayjs(post.created_at).fromNow()}
        </Typography>
      </CardContent>

      {/* Comment Sheet */}
      <CommentSheet isOpen={isCommentSheetOpen} onClose={() => setIsCommentSheetOpen(false)} postId={post.id} />

      {/* Location Sheet */}
      {hasLocation && <LocationSheet isOpen={isLocationSheetOpen} onClose={() => setIsLocationSheetOpen(false)} post={post} />}
    </Card>
  );
}
