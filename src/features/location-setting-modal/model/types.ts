import type { FileWithMetadata } from '@/shared/ui/dropzone';

export interface LocationSettingModalLayoutProps {
  open: boolean;
  onClose: () => void;
  dropzoneFiles: FileWithMetadata[];
  onApply: (updatedFiles: FileWithMetadata[]) => void;
}

export interface MarkerPosition {
  lat: number;
  lng: number;
}

export interface UseLocationEditorProps {
  open: boolean;
  imageFiles: FileWithMetadata[];
}

export interface UseLocationEditorReturn {
  selectedIndex: number;
  imageFiles: FileWithMetadata[];
  markerPositions: Map<number, MarkerPosition>;
  originalPositions: Map<number, MarkerPosition>;
  showToast: boolean;
  mapRef: React.RefObject<HTMLDivElement | null>;
  kakaoMapRef: React.MutableRefObject<kakao.maps.Map | null>;
  markerRef: React.MutableRefObject<kakao.maps.Marker | null>;
  selectedFile: FileWithMetadata | undefined;
  currentPosition: MarkerPosition | undefined;
  handleImageSelect: (index: number) => void;
  handleReset: () => void;
  handleDialogEntered: () => void;
  handleCloseToast: () => void;
}
