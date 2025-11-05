import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

import type { MarkerPosition } from '../model';

interface MapInfoProps {
  selectedFile?: FileWithMetadata;
  currentPosition?: MarkerPosition;
}

export function MapInfo({ selectedFile, currentPosition }: MapInfoProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        boxShadow: 2,
        zIndex: 10,
        maxWidth: 300,
      }}
    >
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        {selectedFile && selectedFile.file.name}
      </Typography>
      <AnimatePresence mode="wait">
        {currentPosition ? (
          <motion.div key="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Typography variant="caption" display="block">
              위도: {currentPosition.lat.toFixed(6)}
            </Typography>
            <Typography variant="caption" display="block">
              경도: {currentPosition.lng.toFixed(6)}
            </Typography>
          </motion.div>
        ) : (
          <motion.div key="no-position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Typography variant="caption" color="text.secondary">
              지도를 클릭하여 위치를 설정하세요
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
