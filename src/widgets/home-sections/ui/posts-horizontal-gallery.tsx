'use client';

import { Box, Typography, Container, CircularProgress, Button, useMediaQuery, useTheme, Chip, Stack } from '@mui/material';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Article } from '@mui/icons-material';
import Link from 'next/link';

import { useInfinitePosts } from '@/features/post-feed/hooks/use-infinite-posts';
import { PostCard } from '@/widgets/post-card';

export const PostsHorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '200px' }, // Pre-load or keep alive slightly outside
    );

    if (targetRef.current) observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Smooth out the scroll progress for better feel
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const { data, isLoading, isError } = useInfinitePosts({ isPublic: true, enabled: isInView });

  // Flatten posts from infinite query pages

  const posts = useMemo(() => data?.pages.flatMap((page) => page) || [], [data?.pages]);

  useEffect(() => {
    if (!isInView) return;
    // Measure width dynamically using ResizeObserver
    if (scrollRef.current && targetRef.current) {
      const updateWidth = () => {
        if (!scrollRef.current) return;

        const scrollWidth = scrollRef.current.scrollWidth;
        const clientWidth = window.innerWidth;

        // On mobile, we want a slightly different feel for the end of the scroll
        const extraBuffer = isMobile ? 80 : 150;
        setScrollRange(scrollWidth - clientWidth + extraBuffer);
      };

      updateWidth();

      const resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });

      resizeObserver.observe(scrollRef.current);
      window.addEventListener('resize', updateWidth);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateWidth);
      };
    }
  }, [posts, isLoading, isError, isInView, isMobile]);

  // Transform vertical scroll [0, 1] to horizontal translation [0, -scrollRange]
  // Only calculate if visible to save CPU
  const x = useTransform(smoothProgress, [0, 1], [0, -scrollRange]);

  return (
    <Box
      ref={targetRef}
      sx={{
        height: '400vh',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 0% 0%, #1a1a1a 0%, #000 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(212, 45, 103, 0.05) 0%, transparent 70%)',
            filter: 'blur(100px)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(79, 195, 247, 0.05) 0%, transparent 70%)',
            filter: 'blur(100px)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth={false} sx={{ position: 'relative', px: 0 }}>
          <Box sx={{ mb: { xs: 3, sm: 6 }, px: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: '50%', bgcolor: 'rgba(79, 195, 247, 0.1)' }}>
              <Article sx={{ fontSize: { xs: 30, sm: 40 }, color: '#4FC3F7' }} />
            </Box>
            <Box>
              <Typography
                variant="h2"
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(45deg, #4FC3F7 30%, #fff 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '3rem', md: '3.75rem' },
                }}
              >
                P O S T
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1.25rem' } }}>
                스크롤하여 최근 게시물을 확인해보세요
              </Typography>
            </Box>
          </Box>

          {/* Horizontal Strip Container */}
          <Box sx={{ display: 'flex', width: 'max-content' }}>
            <motion.div
              ref={scrollRef}
              style={{
                x,
                display: 'flex',
                gap: isMobile ? '20px' : '40px',
                paddingLeft: isMobile ? '20px' : '48px',
                paddingRight: isMobile ? '40px' : '80px',
                width: 'max-content',
              }}
            >
              {/* Intro Card */}
              <Box
                sx={{
                  minWidth: { xs: '300px', sm: '420px' },
                  width: { xs: '300px', sm: '420px' },
                  height: { xs: '520px', sm: '620px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 3, sm: 5 },
                  bgcolor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 250,
                    height: 250,
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2397 75%, #bc1888 100%)',
                    filter: 'blur(60px)',
                    opacity: 0.15,
                    borderRadius: '50%',
                  }}
                />
                <Typography
                  variant="h2"
                  fontWeight="900"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.2rem', sm: '3.5rem' },
                    lineHeight: 1.2,
                    mb: { xs: 2, sm: 3 },
                    background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.5) 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🐾 발자국을
                  <br />
                  지도에 표시해보세요
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    mb: 3,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  사진 EXIF 메타데이터를 분석하여
                  <br />
                  GPS 위치 기반으로
                  <br />
                  Kakao Maps 위에 사진을 표시합니다.
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 5, gap: 1 }}>
                  {['Motion 12', 'TanStack Query', 'Supabase DB', 'Firebase Storage', 'TMAP API', 'Kakao Maps'].map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(79, 195, 247, 0.05)',
                        color: 'rgba(79, 195, 247, 0.6)',
                        border: '1px solid rgba(79, 195, 247, 0.15)',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        cursor: 'default',
                        height: { xs: '22px', sm: '26px' },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(79, 195, 247, 0.1)',
                          color: '#4FC3F7',
                          borderColor: '#4FC3F7',
                          transform: 'rotate(3deg)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Loading State */}
              {isLoading && (
                <Box sx={{ minWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress sx={{ color: '#4FC3F7' }} />
                </Box>
              )}

              {/* Error State */}
              {isError && (
                <Box sx={{ minWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="error">Failed to load posts</Typography>
                </Box>
              )}

              {/* Posts */}
              {posts.map((post) => (
                <Box
                  key={post.id}
                  sx={{
                    minWidth: { xs: '300px', sm: '400px' },
                    width: { xs: '300px', sm: '400px' },
                    height: { xs: '520px', sm: '620px' },
                    transform: 'scale(1)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                    '& > div': {
                      height: '100%',
                      '& .MuiCardContent-root': {
                        height: 'auto',
                        overflowY: 'auto',
                      },
                    },
                  }}
                >
                  <PostCard post={post} />
                </Box>
              ))}

              {/* End Card - Simple & Clean */}
              <Box
                sx={{
                  minWidth: { xs: '200px', sm: '300px' },
                  height: { xs: '520px', sm: '620px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 4, sm: 8 },
                }}
              >
                <Button
                  component={Link}
                  href="/posts"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#fff',
                    color: '#000',
                    fontWeight: 900,
                    px: 6,
                    py: 2.5,
                    borderRadius: '100px',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    '&:hover': {
                      bgcolor: '#fff',
                      transform: 'scale(1.05) rotate(3deg)',
                      boxShadow: '0 25px 50px rgba(255,255,255,0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                >
                  전체 포스트 보기 &rarr;
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
