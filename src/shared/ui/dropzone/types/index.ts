export interface FileWithMetadata {
  id: string;
  file: File;
  preview?: string;
  optimized?: File;
  metadata?: {
    // 기본 정보
    width?: number;
    height?: number;
    orientation?: number;

    // 위치 정보
    latitude?: number;
    longitude?: number;

    // 촬영 정보
    dateTaken?: Date;
    make?: string; // 카메라 제조사
    model?: string; // 카메라 모델

    // 노출 3요소
    iso?: number; // ISO 감도
    fNumber?: number; // 조리개 값 (F-stop)
    exposureTime?: number; // 셔터 스피드 (초)

    // 추가 카메라 정보
    focalLength?: number; // 초점거리 (mm)
    flash?: number | string; // 플래시 사용 여부
    whiteBalance?: number | string; // 화이트 밸런스
    software?: string; // 편집 소프트웨어

    [key: string]: unknown;
  };
  uploadProgress?: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
}
