'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';

export interface MapMarker {
  latitude: number;
  longitude: number;
  title?: string;
}

interface KakaoMapProps {
  center: {
    latitude: number;
    longitude: number;
  };
  markers?: MapMarker[];
  level?: number;
  height?: string | number;
  activeIndex?: number;
  onMarkerClick?: (index: number) => void;
}

export function KakaoMap({ center, markers = [], level = 3, height = '300px', activeIndex, onMarkerClick }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  const centerKey = useMemo(() => `${center.latitude},${center.longitude}`, [center.latitude, center.longitude]);
  const markersKey = useMemo(() => markers.map((m) => `${m.latitude},${m.longitude}`).join('|'), [markers]);

  const cleanupMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  useEffect(() => {
    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      if (!window.kakao || !window.kakao.maps) {
        console.error('Kakao Maps API not loaded');
        return;
      }

      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      const mapOption = {
        center: new window.kakao.maps.LatLng(center.latitude, center.longitude),
        level,
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      mapInstanceRef.current = map;

      cleanupMarkers();

      const bounds = new window.kakao.maps.LatLngBounds();

      if (markers.length > 0) {
        markers.forEach((markerData, index) => {
          const markerPosition = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude);

          const isActive = activeIndex !== undefined && activeIndex === index;
          const imageSize = isActive ? new window.kakao.maps.Size(36, 36) : new window.kakao.maps.Size(24, 24);

          const markerImage = new window.kakao.maps.MarkerImage('/images/map/marker_photo-spot_miku.png', imageSize);

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: markerData.title,
            image: markerImage,
            clickable: true,
          });

          if (onMarkerClick) {
            window.kakao.maps.event.addListener(marker, 'click', () => {
              onMarkerClick(index);
            });
          }

          marker.setMap(map);
          markersRef.current.push(marker);
          bounds.extend(markerPosition);
        });

        if (markers.length > 1) {
          map.setBounds(bounds, 50, 50, 50, 50);
        }
      } else {
        const markerPosition = new window.kakao.maps.LatLng(center.latitude, center.longitude);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });

        marker.setMap(map);
        markersRef.current.push(marker);
      }
    });

    return cleanupMarkers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerKey, level, markersKey, activeIndex, onMarkerClick, cleanupMarkers]);

  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.relayout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize styles
  const boxStyles = useMemo(
    () => ({
      width: '100%',
      height,
      borderRadius: 1,
      overflow: 'hidden',
    }),
    [height],
  );

  return <Box ref={mapRef} sx={boxStyles} />;
}
