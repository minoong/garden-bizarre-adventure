'use client';

import { motion } from 'motion/react';
import { Box, Button, type ButtonProps } from '@mui/material';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  stickyTop?: string;
  marginTop?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

export function ActionButton({ children, onClick, stickyTop = '100px', marginTop = '70vh', variant = 'contained', size = 'large' }: ActionButtonProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: stickyTop,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        zIndex: 10,
        pointerEvents: 'auto',
        mt: marginTop,
      }}
    >
      <Button
        component={motion.button}
        initial={{ scale: 0, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{
          rotate: 5,
          scale: 1.2,
        }}
        whileTap={{ scale: 0.8, rotate: 5 }}
        variant={variant}
        size={size}
        onClick={onClick}
      >
        {children}
      </Button>
    </Box>
  );
}
