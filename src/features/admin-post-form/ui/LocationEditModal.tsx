'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

interface LocationEditModalProps {
  open: boolean;
  onClose: () => void;
  dropzoneFiles: FileWithMetadata[];
  onApply: (updatedFiles: FileWithMetadata[]) => void;
}

interface MarkerPosition {
  lat: number;
  lng: number;
}

export function LocationEditModal({ open, onClose, dropzoneFiles, onApply }: LocationEditModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [markerPositions, setMarkerPositions] = useState<Map<number, MarkerPosition>>(new Map());
  const [originalPositions, setOriginalPositions] = useState<Map<number, MarkerPosition>>(new Map());

  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const markerRef = useRef<kakao.maps.Marker | null>(null);
  const selectedIndexRef = useRef(selectedIndex);

  // selectedIndex 변경 시 ref 업데이트
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // 이미지가 있는 파일만 필터링 (useMemo로 메모이제이션)
  const imageFiles = useMemo(() => dropzoneFiles.filter((f) => f.file.type.startsWith('image/')), [dropzoneFiles]);

  // 현재 선택된 파일
  const selectedFile = imageFiles[selectedIndex];

  // 초기 위치 설정 (모달 열릴 때 한 번만)
  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      return;
    }

    // 모달이 열릴 때만 초기 위치 설정
    const initial = new Map<number, MarkerPosition>();
    imageFiles.forEach((file, index) => {
      if (file.metadata?.latitude && file.metadata?.longitude) {
        initial.set(index, {
          lat: file.metadata.latitude,
          lng: file.metadata.longitude,
        });
      }
    });
    setMarkerPositions(new Map(initial));
    setOriginalPositions(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // imageFiles 제거!

  // 모달이 닫힐 때 지도 정리
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      kakaoMapRef.current = null;
    };
  }, []);

  // 초기화 - 원본 위치로 복구
  const handleReset = useCallback(() => {
    const originalPosition = originalPositions.get(selectedIndex);
    if (originalPosition) {
      setMarkerPositions((prev) => {
        const next = new Map(prev);
        next.set(selectedIndex, originalPosition);
        return next;
      });
    } else {
      // 원본에 위치가 없으면 삭제
      setMarkerPositions((prev) => {
        const next = new Map(prev);
        next.delete(selectedIndex);
        return next;
      });
    }
  }, [selectedIndex, originalPositions]);

  // Dialog가 완전히 열린 후 지도 초기화
  const handleDialogEntered = () => {
    if (!mapRef.current) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      // 카카오 맵 SDK 로드 확인
      if (typeof kakao === 'undefined' || !kakao.maps) {
        console.error('카카오 맵 SDK가 로드되지 않았습니다.');
        return;
      }

      // 지도 초기화 (처음에만)
      if (!kakaoMapRef.current) {
        // 초기 위치 가져오기
        const currentPosition = markerPositions.get(selectedIndex);
        const initialCenter = currentPosition ? new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng) : new kakao.maps.LatLng(37.5665, 126.978);

        const mapOption = {
          center: initialCenter,
          level: 3,
        };
        const map = new kakao.maps.Map(mapRef.current, mapOption);
        kakaoMapRef.current = map;

        // 지도 클릭 이벤트 - 마커 생성/이동
        kakao.maps.event.addListener(map, 'click', (mouseEvent: kakao.maps.event.MouseEvent) => {
          const latlng = mouseEvent.latLng;
          const newPosition = {
            lat: latlng.getLat(),
            lng: latlng.getLng(),
          };

          setMarkerPositions((prev) => {
            const next = new Map(prev);
            next.set(selectedIndexRef.current, newPosition);
            return next;
          });
        });

        // 초기 마커 생성
        if (currentPosition) {
          const marker = new kakao.maps.Marker({
            position: initialCenter,
            map: map,
            draggable: true,
          });

          // 마커 드래그 이벤트
          kakao.maps.event.addListener(marker, 'dragend', () => {
            const position = marker.getPosition();
            setMarkerPositions((prev) => {
              const next = new Map(prev);
              next.set(selectedIndexRef.current, {
                lat: position.getLat(),
                lng: position.getLng(),
              });
              return next;
            });
          });

          markerRef.current = marker;
        }
      }
    });
  };

  // 선택된 이미지 변경 또는 markerPositions 변경 시 마커 업데이트
  useEffect(() => {
    if (!open || !kakaoMapRef.current || !selectedFile) return;

    const currentPosition = markerPositions.get(selectedIndex);

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // 현재 위치가 있으면 새 마커 생성
    if (currentPosition) {
      const markerPosition = new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: kakaoMapRef.current,
        draggable: true,
      });

      // 마커 드래그 이벤트
      kakao.maps.event.addListener(marker, 'dragend', () => {
        const position = marker.getPosition();
        setMarkerPositions((prev) => {
          const next = new Map(prev);
          next.set(selectedIndexRef.current, {
            lat: position.getLat(),
            lng: position.getLng(),
          });
          return next;
        });
      });

      markerRef.current = marker;

      // 이미지 선택 시 해당 마커 위치로 지도 중심 이동
      kakaoMapRef.current.setCenter(markerPosition);
    }
  }, [open, selectedIndex, selectedFile, markerPositions]);

  // 이미지 선택
  const handleImageSelect = (index: number) => {
    setSelectedIndex(index);
  };

  // 적용
  const handleApply = () => {
    // markerPositions를 기반으로 dropzoneFiles 업데이트
    const updatedFiles = imageFiles.map((file, index) => {
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

  const currentPosition = markerPositions.get(selectedIndex);

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
        {/* 헤더 */}
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

        {/* 메인 컨텐츠 */}
        <DialogContent sx={{ flex: 1, display: 'flex', p: 0, overflow: 'hidden' }}>
          {/* 좌측: 이미지 목록 */}
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
              // 커스텀 스크롤바
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: 'grey.600',
                },
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleImageSelect(index)}
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

          {/* 우측: 지도 */}
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

            {/* 지도 위 정보 */}
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

            {/* 초기화 버튼 */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            >
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={!currentPosition}
              >
                초기화
              </Button>
            </Box>
          </Box>
        </DialogContent>

        {/* 하단 버튼 */}
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
          <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Button component={motion.button} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} variant="outlined" size="large">
              취소
            </Button>
            <Button component={motion.button} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleApply} variant="contained" size="large">
              적용
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
