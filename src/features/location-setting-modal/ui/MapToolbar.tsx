import { Box, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { motion } from 'motion/react';

interface MapToolbarProps {
  onReset: () => void;
  hasPosition: boolean;
}

export function MapToolbar({ onReset, hasPosition }: MapToolbarProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        display: 'flex',
        gap: 1,
      }}
    >
      <Button
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={onReset}
        disabled={!hasPosition}
      >
        초기화
      </Button>
    </Box>
  );
}
