'use client';

import { Box, Container, Grid, Typography } from '@mui/material';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface ScrollSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
  background?: string;
  variant?: 'side' | 'stacked';
  fullWidth?: boolean;
}

export const ScrollSection = ({
  title,
  description,
  children,
  align = 'left',
  background = 'transparent',
  variant = 'side',
  fullWidth = false,
}: ScrollSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const isLeft = align === 'left';
  const isStacked = variant === 'stacked';

  const content = (
    <Grid
      container
      spacing={isStacked ? 4 : 8}
      direction={isLeft ? 'row' : 'row-reverse'}
      sx={{ flexDirection: isStacked ? 'column' : undefined, alignItems: 'center' }}
    >
      <Grid size={{ xs: 12, md: isStacked ? 12 : 5 }}>
        <motion.div style={{ y: isStacked ? 0 : yText, opacity }}>
          <Box sx={{ textAlign: isStacked ? 'center' : 'inherit', mb: isStacked ? 2 : 0 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: isStacked ? { xs: '2.5rem', md: '3.5rem' } : undefined,
                background: 'linear-gradient(45deg, #fff 30%, #666 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 4,
                lineHeight: 1.6,
                maxWidth: isStacked ? '800px' : 'none',
                mx: isStacked ? 'auto' : 'inherit',
              }}
            >
              {description}
            </Typography>
          </Box>
        </motion.div>
      </Grid>

      <Grid size={{ xs: 12, md: isStacked ? 12 : 7 }} sx={{ width: '100%' }}>
        <motion.div
          style={{
            scale: isStacked ? 1 : scale,
            opacity,
            width: '100%',
          }}
        >
          {children}
        </motion.div>
      </Grid>
    </Grid>
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: isStacked ? 'auto' : '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: background,
        overflow: 'hidden',
        py: 10,
      }}
    >
      {fullWidth ? <Box sx={{ width: '100%' }}>{content}</Box> : <Container maxWidth="lg">{content}</Container>}
    </Box>
  );
};
