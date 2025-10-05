'use client';

import { motion, useTransform } from 'motion/react';
import { Box, Typography } from '@mui/material';

import { useHeroContext } from './hero-root';

interface TextPanelProps {
  text: string;
  scrollRange: {
    opacity: number[];
    scale: number[];
    opacityValues: number[];
    scaleValues: number[];
  };
  position: {
    top: { xs: string; md: string };
    left?: { xs: string; md: string };
    right?: { xs: string; md: string };
  };
  rotate?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export function TextPanel({ text, scrollRange, position, rotate, textAlign = 'center' }: TextPanelProps) {
  const { scrollYProgress } = useHeroContext();
  const opacity = useTransform(scrollYProgress, scrollRange.opacity, scrollRange.opacityValues);
  const scale = useTransform(scrollYProgress, scrollRange.scale, scrollRange.scaleValues);

  return (
    <Box
      component={motion.div}
      style={{
        scale,
        opacity,
      }}
      sx={{
        position: 'fixed',
        ...position,
        textAlign,
        px: 2,
        maxWidth: '80%',
        ...(rotate && { rotate }),
      }}
    >
      <Typography
        variant="h3"
        component="h2"
        sx={{
          fontWeight: 'bold',
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
          color: 'white',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
