'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, IconButton, Typography, Snackbar, Alert, DialogContent } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion } from 'motion/react';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

import { useLocationEditor } from '../model';
import type { LocationSettingModalLayoutProps } from '../model';

import { ImageList } from './ImageList';
import { MapView } from './MapView';

export function LocationSettingModalLayout({ open, onClose, dropzoneFiles, onApply }: LocationSettingModalLayoutProps) {
  const [showToast, setShowToast] = useState(false);

  const { selectedIndex, imageFiles, selectedFile, markerPositions, currentPosition, handleImageSelect, handleReset, handleDialogEntered, mapRef } =
    useLocationEditor({
      open,
      imageFiles: dropzoneFiles,
    });

  const handleImageSelectWithToast = (index: number) => {
    handleImageSelect(index);

    const file = imageFiles[index];
    const hasLocation = file.metadata?.latitude && file.metadata?.longitude;

    if (!hasLocation) {
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleApply = () => {
    const updatedFiles = imageFiles.map((file: FileWithMetadata, index: number) => {
      const position = markerPositions.get(index);
      if (position) {
        return {
          ...file,
          metadata: {
            ...file.metadata,
            latitude: position.lat,
            longitude: position.lng,
          },
        };
      }
      return file;
    });

    onApply(updatedFiles);
    onClose();
  };

  // 취소
  const handleCancel = () => {
    onClose();
  };

  if (imageFiles.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      slotProps={{
        transition: {
          onEntered: handleDialogEntered,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="h5" fontWeight="bold">
            위치 설정
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ flex: 1, display: 'flex', p: 0, overflow: 'hidden' }}>
          <ImageList imageFiles={imageFiles} selectedIndex={selectedIndex} markerPositions={markerPositions} onImageSelect={handleImageSelectWithToast} />

          <MapView mapRef={mapRef} selectedFile={selectedFile} currentPosition={currentPosition} onReset={handleReset} />
        </DialogContent>

        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
            <Button component={motion.button} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} variant="outlined" size="large">
              취소
            </Button>
            <Button component={motion.button} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleApply} variant="contained" size="large">
              적용
            </Button>
          </DialogActions>
        </Box>

        <Snackbar
          open={showToast}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 70, sm: 80 } }}
        >
          <Alert onClose={handleCloseToast} severity="warning" sx={{ width: '100%' }}>
            이 이미지에는 위치 정보가 없습니다. 지도를 클릭하여 위치를 설정하세요.
          </Alert>
        </Snackbar>
      </Box>
    </Dialog>
  );
}
