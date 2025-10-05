'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useScroll, type MotionValue } from 'motion/react';
import { Box, Container } from '@mui/material';

interface HeroContextValue {
  scrollYProgress: MotionValue<number>;
}

const HeroContext = createContext<HeroContextValue | null>(null);

export function useHeroContext() {
  const context = useContext(HeroContext);
  if (!context) {
    throw new Error('Hero compound components must be used within Hero.Root');
  }
  return context;
}

interface HeroRootProps {
  children: ReactNode;
  height?: string;
}

export function HeroRoot({ children, height = '5000px' }: HeroRootProps) {
  const { scrollYProgress } = useScroll();

  return (
    <HeroContext.Provider value={{ scrollYProgress }}>
      <Container>
        <Box
          sx={{
            position: 'relative',
            height,
            pointerEvents: 'none',
          }}
        >
          {children}
        </Box>
      </Container>
    </HeroContext.Provider>
  );
}
