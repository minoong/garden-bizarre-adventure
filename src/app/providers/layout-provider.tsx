'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
          py: { xs: 2, md: 4 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};
