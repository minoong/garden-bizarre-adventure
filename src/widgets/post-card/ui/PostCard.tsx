'use client';

import { useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Avatar, Box, Card, CardActions, CardContent, CardHeader, Chip, GlobalStyles, IconButton, Stack, Typography } from '@mui/material';
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
import { formatCountWithComma } from '@/shared/lib/utils';

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

  const images = post.post_images.sort((a, b) => a.display_order - b.display_order);
  const categories = post.post_categories.map((pc) => pc.categories).filter((c): c is NonNullable<typeof c> => c !== null);

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
          <GlobalStyles
            styles={{
              '.post-card-swiper .swiper-pagination-bullet': {
                width: '4px !important',
                height: '4px !important',
                background: 'rgba(0, 0, 0, 0.4) !important',
                opacity: '1 !important',
                margin: '0 2px !important',
                transition: 'all 0.3s !important',
                display: 'inline-block !important',
              },
              '.post-card-swiper .swiper-pagination-bullet-active': {
                background: 'rgba(0, 123, 255, 1) !important',
                transform: 'scale(1.3) !important',
              },
            }}
          />
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
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleBookmark} sx={{ p: 1, color: 'white' }}>
          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </CardActions>

      {/* Content */}
      <CardContent sx={{ pt: 0, pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Title and Content */}
        <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
          <Box component="span" fontWeight="bold" mr={0.5}>
            {post.profiles?.username || 'Unknown'}
          </Box>
          {post.title && <Box component="span">{post.title}</Box>}
          {post.content && (
            <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
              {post.title ? ` ${post.content}` : post.content}
            </Box>
          )}
        </Typography>

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
    </Card>
  );
}
