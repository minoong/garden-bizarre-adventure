'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold">
            위치 설정
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 메인 컨텐츠 */}
        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
          {/* 이미지 슬라이더 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              overflowX: 'auto',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          >
            {imageFiles.map((file, index) => (
              <Box
                key={file.id}
                onClick={() => handleImageSelect(index)}
                sx={{
                  minWidth: 120,
                  height: 120,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: selectedIndex === index ? 'primary.main' : 'transparent',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
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
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                {markerPositions.has(index) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'success.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    ✓
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* 지도 및 정보 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* 지도 */}
            <Box sx={{ flex: 1, position: 'relative' }}>
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
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 2,
                  zIndex: 10,
                }}
              >
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {selectedFile && selectedFile.file.name}
                </Typography>
                {currentPosition ? (
                  <>
                    <Typography variant="caption" display="block">
                      위도: {currentPosition.lat.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      경도: {currentPosition.lng.toFixed(6)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    지도를 클릭하여 위치를 설정하세요
                  </Typography>
                )}
              </Box>

              {/* 초기화 버튼 */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleReset} disabled={!currentPosition}>
                  초기화
                </Button>
              </Box>
            </Box>

            {/* 사이드바 - 이미지 미리보기 */}
            {selectedFile && (
              <Box
                sx={{
                  width: { xs: '100%', md: 300 },
                  borderLeft: { md: 1 },
                  borderTop: { xs: 1, md: 0 },
                  borderColor: 'divider',
                  p: 2,
                  bgcolor: 'grey.50',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  선택된 이미지
                </Typography>
                {selectedFile.preview && (
                  <Box
                    component="img"
                    src={selectedFile.preview}
                    alt={selectedFile.file.name}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary" display="block">
                  {selectedFile.file.name}
                </Typography>
                {selectedFile.metadata?.dateTaken && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    촬영: {new Date(selectedFile.metadata.dateTaken).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* 하단 버튼 */}
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
          <Button onClick={handleCancel} variant="outlined" size="large">
            취소
          </Button>
          <Button onClick={handleApply} variant="contained" size="large">
            적용
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
