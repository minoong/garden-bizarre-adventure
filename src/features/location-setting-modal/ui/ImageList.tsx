import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

import type { MarkerPosition } from '../model';

interface ImageListProps {
  imageFiles: FileWithMetadata[];
  selectedIndex: number;
  markerPositions: Map<number, MarkerPosition>;
  onImageSelect: (index: number) => void;
}

export function ImageList({ imageFiles, selectedIndex, markerPositions, onImageSelect }: ImageListProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      sx={{
        width: { xs: '100%', md: 280 },
        borderRight: { md: 1 },
        borderColor: 'divider',
        bgcolor: 'grey.50',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'transparent',
          borderRadius: '3px',
          transition: 'background-color 0.2s',
        },
        '&:hover::-webkit-scrollbar-thumb': {
          bgcolor: 'grey.400',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          bgcolor: 'grey.600',
        },
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        이미지 목록 ({imageFiles.length})
      </Typography>
      {imageFiles.map((file, index) => (
        <Box
          key={file.id}
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onImageSelect(index)}
          sx={{
            flexShrink: 0,
            cursor: 'pointer',
            border: 2,
            borderColor: selectedIndex === index ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: 'primary.light',
              boxShadow: 2,
            },
            '&:hover img': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {file.preview && (
            <Box
              component="img"
              src={file.preview}
              alt={file.file.name}
              sx={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                transition: 'transform 0.1s ease-in-out',
              }}
            />
          )}
          <AnimatePresence>
            {markerPositions.has(index) && (
              <Box
                component={motion.div}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                  boxShadow: 2,
                }}
              >
                ✓
              </Box>
            )}
          </AnimatePresence>
          <Box
            component={motion.div}
            animate={{
              backgroundColor: selectedIndex === index ? 'rgba(25, 118, 210, 0.12)' : 'rgba(255, 255, 255, 1)',
            }}
            transition={{ duration: 0.2 }}
            sx={{ p: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selectedIndex === index ? 'bold' : 'normal',
                color: selectedIndex === index ? 'primary.main' : 'text.secondary',
              }}
            >
              {file.file.name}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
