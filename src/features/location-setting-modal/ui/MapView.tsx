import { Box } from '@mui/material';
import { motion } from 'motion/react';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

import type { MarkerPosition } from '../model';

import { MapInfo } from './MapInfo';
import { MapToolbar } from './MapToolbar';

interface MapViewProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  selectedFile?: FileWithMetadata;
  currentPosition?: MarkerPosition;
  onReset: () => void;
}

export function MapView({ mapRef, selectedFile, currentPosition, onReset }: MapViewProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 400,
        }}
      />

      <MapInfo selectedFile={selectedFile} currentPosition={currentPosition} />

      <MapToolbar onReset={onReset} hasPosition={!!currentPosition} />
    </Box>
  );
}
