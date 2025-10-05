'use client';

import { motion, useTransform } from 'motion/react';
import { Box } from '@mui/material';

import { useHeroContext } from './hero-root';

interface BackgroundImageProps {
  src: string;
  scaleRange?: [number, number];
  opacityRange?: [number, number, number];
}

export function BackgroundImage({ src, scaleRange = [1, 1.5], opacityRange = [1, 0.5, 0] }: BackgroundImageProps) {
  const { scrollYProgress } = useHeroContext();
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], opacityRange);

  return (
    <Box
      component={motion.div}
      style={{
        scale,
        opacity,
      }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
