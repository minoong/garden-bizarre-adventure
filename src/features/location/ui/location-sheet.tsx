'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Chip, GlobalStyles, IconButton, Snackbar, Alert, Skeleton } from '@mui/material';
import { Sheet, type SheetRef } from 'react-modal-sheet';
import { useQueries } from '@tanstack/react-query';
import { ContentCopy as ContentCopyIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import type { Post } from '@/entities/post';
import { reverseGeocoding } from '@/shared/api/tmap/reverse-geocoding';

import { KakaoMap, type MapMarker } from './kakao-map';

interface LocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export function LocationSheet({ isOpen, onClose, post }: LocationSheetProps) {
  const ref = useRef<SheetRef>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const roadSwiperRef = useRef<SwiperType | null>(null);
  const jibunSwiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Memoize computed values
  const hasMainLocation = useMemo(() => post.latitude !== null && post.longitude !== null, [post.latitude, post.longitude]);

  const imagesWithLocation = useMemo(
    () => post.post_images.filter((img) => img.latitude !== null && img.longitude !== null).sort((a, b) => a.display_order - b.display_order),
    [post.post_images],
  );

  const imageLocations = useMemo(
    () =>
      imagesWithLocation.map(
        (img): MapMarker => ({
          latitude: img.latitude!,
          longitude: img.longitude!,
          title: `사진 ${img.display_order + 1}`,
        }),
      ),
    [imagesWithLocation],
  );

  const hasImageLocations = imageLocations.length > 0;

  const addressQueries = useQueries({
    queries: imagesWithLocation.map((img) => ({
      queryKey: ['reverseGeocoding', img.latitude, img.longitude],
      queryFn: () =>
        reverseGeocoding({
          latitude: img.latitude!,
          longitude: img.longitude!,
        }),
      enabled: isOpen && img.latitude !== null && img.longitude !== null,
      staleTime: 1000 * 60 * 60,
    })),
  });

  const handleMarkerClick = useCallback((index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
      setActiveIndex(index);
    }
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);

    if (roadSwiperRef.current && roadSwiperRef.current.activeIndex !== swiper.activeIndex) {
      roadSwiperRef.current.slideTo(swiper.activeIndex);
    }
    if (jibunSwiperRef.current && jibunSwiperRef.current.activeIndex !== swiper.activeIndex) {
      jibunSwiperRef.current.slideTo(swiper.activeIndex);
    }
  }, []);

  const handleResetActiveIndex = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const currentAddressQuery = addressQueries[activeIndex];
  const currentAddress = currentAddressQuery?.data;

  const handleCopyToClipboard = useCallback(async (text: string, type: '도로명' | '지번') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(`${type} 복사가 완료되었습니다.`);
      setToastOpen(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  if (!hasMainLocation && !hasImageLocations) {
    return null;
  }

  return (
    <Sheet ref={ref} isOpen={isOpen} onClose={onClose} snapPoints={[0, 1]} initialSnap={1} onCloseEnd={handleResetActiveIndex}>
      <Sheet.Container style={{ backgroundColor: '#111' }}>
        <Sheet.Header style={{ backgroundColor: '#111' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                width: 40,
                height: 4,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
              }}
            />
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mt: 2 }}>
              위치 정보
            </Typography>
          </Box>
        </Sheet.Header>
        <Sheet.Content style={{ backgroundColor: '#111', paddingBottom: '20px' }} disableDrag>
          {hasImageLocations && imagesWithLocation.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <GlobalStyles
                styles={{
                  '.location-sheet-swiper .swiper-pagination-bullet': {
                    width: '4px !important',
                    height: '4px !important',
                    background: 'rgba(0, 0, 0, 0.4) !important',
                    opacity: '1 !important',
                    margin: '0 2px !important',
                    transition: 'all 0.3s !important',
                    display: 'inline-block !important',
                  },
                  '.location-sheet-swiper .swiper-pagination-bullet-active': {
                    background: 'rgba(0, 123, 255, 1) !important',
                    transform: 'scale(1.8) !important',
                  },
                }}
              />
              <Box sx={{ width: '100%', height: '200px', bgcolor: '#111', position: 'relative' }}>
                {imagesWithLocation.length > 1 && (
                  <Chip
                    label={`${activeIndex + 1}/${imagesWithLocation.length}`}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '10px',
                      height: '22px',
                      '& .MuiChip-label': {
                        px: 1.5,
                      },
                    }}
                  />
                )}
                <Swiper
                  className="location-sheet-swiper"
                  modules={[Pagination]}
                  pagination={{ clickable: true }}
                  onSwiper={(swiper) => (swiperRef.current = swiper)}
                  onSlideChange={handleSlideChange}
                  style={{ width: '100%', height: '100%' }}
                >
                  {imagesWithLocation.map((image) => (
                    <SwiperSlide key={image.id}>
                      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                        <Image
                          src={image.image_url}
                          alt={`Location image ${image.display_order + 1}`}
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="100vw"
                          priority
                        />
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>

              {currentAddressQuery?.isLoading ? (
                <Box sx={{ px: 2, pt: 1.5 }}>
                  <Skeleton variant="rectangular" width="100%" height={70} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1.5 }} />
                </Box>
              ) : (
                <Box sx={{ px: 2, pt: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 1.5,
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                          도로명
                        </Typography>
                        <Box sx={{ height: '20px', overflow: 'hidden', position: 'relative' }}>
                          <motion.div
                            animate={{ y: -activeIndex * 20 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                          >
                            {addressQueries.map((query, index) => (
                              <Box key={`road-motion-${index}`} sx={{ height: '20px' }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {query.data?.newRoadAddr || ''}
                                </Typography>
                              </Box>
                            ))}
                          </motion.div>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => currentAddress && handleCopyToClipboard(currentAddress.newRoadAddr, '도로명')}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                          지번
                        </Typography>
                        <Box sx={{ height: '20px', overflow: 'hidden', position: 'relative' }}>
                          <motion.div
                            animate={{ y: -activeIndex * 20 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                          >
                            {addressQueries.map((query, index) => (
                              <Box key={`jibun-motion-${index}`} sx={{ height: '20px' }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.875rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {query.data?.jibunAddr || ''}
                                </Typography>
                              </Box>
                            ))}
                          </motion.div>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => currentAddress && handleCopyToClipboard(currentAddress.jibunAddr, '지번')}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ px: 2, pb: 2 }}>
            {hasMainLocation && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1.5 }}>
                  대표 위치
                </Typography>
                {post.location_name && (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    {post.location_name}
                  </Typography>
                )}
                <KakaoMap
                  center={{
                    latitude: post.latitude!,
                    longitude: post.longitude!,
                  }}
                  level={3}
                  height="250px"
                />
              </Box>
            )}

            {hasMainLocation && hasImageLocations && <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />}

            {hasImageLocations && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                  <PhotoCameraIcon sx={{ fontSize: 20, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                    사진 위치
                  </Typography>
                  <Typography component="span" variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    ({imageLocations.length}개)
                  </Typography>
                </Box>
                <KakaoMap
                  center={{
                    latitude: imageLocations[0].latitude,
                    longitude: imageLocations[0].longitude,
                  }}
                  markers={imageLocations}
                  level={5}
                  height="300px"
                  activeIndex={activeIndex}
                  onMarkerClick={handleMarkerClick}
                />
              </Box>
            )}
          </Box>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />

      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        <Alert onClose={handleToastClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Sheet>
  );
}
