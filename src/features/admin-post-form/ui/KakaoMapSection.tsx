'use client';

import { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

interface KakaoMapSectionProps {
  dropzoneFiles: FileWithMetadata[];
}

interface LocationPoint {
  lat: number;
  lng: number;
  fileName: string;
}

export function KakaoMapSection({ dropzoneFiles }: KakaoMapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  // 파일에서 위치 정보 추출
  const getLocationPoints = (): LocationPoint[] => {
    return dropzoneFiles
      .filter((f) => {
        const lat = f.metadata?.latitude;
        const lng = f.metadata?.longitude;
        return lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);
      })
      .map((f) => ({
        lat: f.metadata!.latitude!,
        lng: f.metadata!.longitude!,
        fileName: f.file.name,
      }));
  };

  // 카카오 맵 초기화 및 마커 표시
  useEffect(() => {
    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      // 파일에서 위치 정보 추출
      const points = dropzoneFiles
        .filter((f) => {
          const lat = f.metadata?.latitude;
          const lng = f.metadata?.longitude;
          return lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);
        })
        .map((f) => ({
          lat: f.metadata!.latitude!,
          lng: f.metadata!.longitude!,
          fileName: f.file.name,
        }));

      // 여러 지점의 중심점 계산
      const calculateCenter = (pts: LocationPoint[]): { lat: number; lng: number } => {
        if (pts.length === 0) {
          // 기본값: 서울 시청
          return { lat: 37.5665, lng: 126.978 };
        }

        if (pts.length === 1) {
          return { lat: pts[0].lat, lng: pts[0].lng };
        }

        const sumLat = pts.reduce((sum, p) => sum + p.lat, 0);
        const sumLng = pts.reduce((sum, p) => sum + p.lng, 0);

        return {
          lat: sumLat / pts.length,
          lng: sumLng / pts.length,
        };
      };

      // 카카오 맵 SDK 로드 확인
      if (typeof kakao === 'undefined' || !kakao.maps) {
        console.error('카카오 맵 SDK가 로드되지 않았습니다.');
        return;
      }

      // 지도 초기화 (처음에만)
      if (!kakaoMapRef.current) {
        const center = calculateCenter(points);
        const mapOption = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: points.length > 1 ? 8 : 3, // 여러 마커가 있으면 줌 아웃
        };

        const map = new kakao.maps.Map(mapRef.current, mapOption);
        kakaoMapRef.current = map;
      }

      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 새로운 마커 추가
      if (points.length > 0) {
        const newMarkers = points.map((point) => {
          const markerPosition = new kakao.maps.LatLng(point.lat, point.lng);
          const marker = new kakao.maps.Marker({
            position: markerPosition,
            map: kakaoMapRef.current as kakao.maps.Map,
          });

          // 인포윈도우 추가
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${point.fileName}</div>`,
          });

          // 마커 클릭 이벤트
          kakao.maps.event.addListener(marker, 'click', () => {
            if (kakaoMapRef.current) {
              infowindow.open(kakaoMapRef.current as kakao.maps.Map, marker);
            }
          });

          return marker;
        });

        markersRef.current = newMarkers;

        // 지도 중심 이동
        const center = calculateCenter(points);
        kakaoMapRef.current?.setCenter(new kakao.maps.LatLng(center.lat, center.lng));

        // 여러 마커가 있을 경우 모든 마커가 보이도록 줌 레벨 조정
        if (points.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          points.forEach((point) => {
            bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
          });
          kakaoMapRef.current?.setBounds(bounds);
        }
      }
    });
  }, [dropzoneFiles]);

  const locationPoints = getLocationPoints();

  console.log('KakaoMapSection 렌더링', { locationPoints });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          촬영 위치 지도
        </Typography>

        {locationPoints.length === 0 ? (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              위치 정보가 있는 파일을 업로드하면 지도에 표시됩니다
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {locationPoints.length}개의 위치가 표시됩니다 (마커를 클릭하면 파일명을 볼 수 있습니다)
            </Typography>
            <Box
              ref={mapRef}
              sx={{
                width: '100%',
                height: 400,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
