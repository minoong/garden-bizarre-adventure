import { useCallback, useEffect, useRef, useState } from 'react';

import type { MarkerPosition, UseLocationEditorProps, UseLocationEditorReturn } from './types';

export function useLocationEditor({ open, imageFiles }: UseLocationEditorProps): UseLocationEditorReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [markerPositions, setMarkerPositions] = useState<Map<number, MarkerPosition>>(new Map());
  const [originalPositions, setOriginalPositions] = useState<Map<number, MarkerPosition>>(new Map());
  const [showToast, setShowToast] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const markerRef = useRef<kakao.maps.Marker | null>(null);
  const selectedIndexRef = useRef(selectedIndex);

  // selectedIndex 변경 시 ref 업데이트
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // 현재 선택된 파일
  const selectedFile = imageFiles[selectedIndex];
  const currentPosition = markerPositions.get(selectedIndex);

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
  }, [open]);

  // 모달이 닫힐 때 지도 정리
  useEffect(() => {
    if (!open) {
      // 모달이 닫힐 때 지도 인스턴스 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (kakaoMapRef.current) {
        kakaoMapRef.current = null;
      }
    }
  }, [open]);

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
  const handleDialogEntered = useCallback(() => {
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
        const currentPos = markerPositions.get(selectedIndex);
        const initialCenter = currentPos ? new kakao.maps.LatLng(currentPos.lat, currentPos.lng) : new kakao.maps.LatLng(37.5665, 126.978);

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
        if (currentPos) {
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
  }, [markerPositions, selectedIndex]);

  // 선택된 이미지 변경 또는 markerPositions 변경 시 마커 업데이트
  useEffect(() => {
    if (!open || !kakaoMapRef.current || !selectedFile) return;

    const currentPos = markerPositions.get(selectedIndex);

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // 현재 위치가 있으면 새 마커 생성
    if (currentPos) {
      const markerPosition = new kakao.maps.LatLng(currentPos.lat, currentPos.lng);
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
  const handleImageSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);

      // 선택한 이미지의 위경도 정보 체크
      const file = imageFiles[index];
      const hasLocation = file.metadata?.latitude && file.metadata?.longitude;

      if (!hasLocation) {
        setShowToast(true);
      }
    },
    [imageFiles],
  );

  // 토스트 닫기
  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    selectedIndex,
    imageFiles,
    markerPositions,
    originalPositions,
    showToast,
    mapRef,
    kakaoMapRef,
    markerRef,
    selectedFile,
    currentPosition,
    handleImageSelect,
    handleReset,
    handleDialogEntered,
    handleCloseToast,
  };
}
