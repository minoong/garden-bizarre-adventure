import type { FileWithMetadata } from '@/shared/ui/dropzone';

/**
 * 업로드된 파일 정보 (Firebase URL 포함)
 */
export interface UploadedFileInfo {
  id: string;
  file: FileWithMetadata;
  firebaseUrl?: string;
  thumbnailUrl?: string;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  error?: string;
}

/**
 * 위치 정보
 */
export interface LocationInfo {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  address?: string; // 주소 API 연동 시 사용
}

/**
 * 게시물 이미지 정보 (Supabase post_images 테이블)
 */
export interface PostImageData {
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  altText?: string;
  displayOrder: number;
}

/**
 * 게시물 데이터 (Supabase posts 테이블)
 */
export interface PostData {
  title?: string;
  content?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  theme?: string;
  postDate?: Date;
  isPublic: boolean;
}

/**
 * 어드민 폼 전체 데이터
 */
export interface AdminPostFormData {
  // 게시물 기본 정보
  title?: string;
  content?: string;
  theme?: string;
  isPublic: boolean;

  // 위치 정보
  locationName?: string;
  latitude?: number;
  longitude?: number;

  // 날짜 범위
  dateFrom: Date;
  dateTo: Date;

  // 태그
  tags: string[];

  // 파일 정보 (내부 상태 관리용)
  files: UploadedFileInfo[];

  // 선택된 파일 ID 목록 (위치 정보 일괄 적용용)
  selectedFileIds: string[];
}
