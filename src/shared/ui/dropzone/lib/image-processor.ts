import imageCompression from 'browser-image-compression';
import exifr from 'exifr';
import heic2any from 'heic2any';
import { v4 as uuidv4 } from 'uuid';

import type { FileWithMetadata } from '../types';

const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  preserveExif: true, // EXIF 메타데이터 보존
};

/**
 * 실제 이미지 크기 가져오기
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * EXIF 메타데이터 추출
 */
export async function extractMetadata(file: File): Promise<FileWithMetadata['metadata']> {
  try {
    // 실제 이미지 크기 가져오기
    const dimensions = await getImageDimensions(file);

    const rawExif = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      interop: true,
      ifd1: true,
    });

    console.log({ rawExif });

    if (!rawExif) {
      return dimensions ? { width: dimensions.width, height: dimensions.height } : {};
    }

    // 날짜/시간 추출 (우선순위: DateTimeOriginal > DateTime > DateTimeDigitized)
    let datetime = rawExif.DateTimeOriginal || rawExif.DateTime || rawExif.DateTimeDigitized;
    if (datetime && typeof datetime !== 'string' && !(datetime instanceof Date)) {
      datetime = String(datetime);
    }

    return {
      // 기본 정보 (실제 이미지 크기 우선, fallback으로 EXIF)
      width: rawExif.ExifImageWidth || rawExif.PixelXDimension,
      height: rawExif.ExifImageHeight || rawExif.PixelYDimension,
      orientation: rawExif.Orientation,

      // 위치 정보
      latitude: rawExif.latitude,
      longitude: rawExif.longitude,

      // 촬영 정보
      dateTaken: datetime ? new Date(datetime) : undefined,
      make: rawExif.Make,
      model: rawExif.Model,

      // 노출 3요소
      iso: rawExif.ISO || rawExif.ISOSpeedRatings,
      fNumber: rawExif.FNumber,
      exposureTime: rawExif.ExposureTime,

      // 추가 정보
      focalLength: rawExif.FocalLength,
      flash: rawExif.Flash,
      whiteBalance: rawExif.WhiteBalance,
      software: rawExif.Software,
    };
  } catch (error) {
    console.warn('Failed to extract EXIF data:', error);
    return {};
  }
}

/**
 * 이미지 최적화
 */
export async function compressImage(file: File, options = DEFAULT_COMPRESSION_OPTIONS): Promise<File> {
  try {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const compressed = await imageCompression(file, options);

    console.log(`Image compressed: ${file.name}, ${file.size} -> ${compressed.size}`);

    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}

/**
 * HEIC 파일을 JPEG로 변환
 * 참고: heic2any는 EXIF 메타데이터를 보존하지 않습니다.
 * 메타데이터는 변환 전에 별도로 추출하여 FileWithMetadata.metadata에 저장합니다.
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw error;
  }
}

/**
 * 파일 처리 (메타데이터 추출 + 이미지 최적화)
 */
export async function processFile(file: File): Promise<FileWithMetadata> {
  const id = uuidv4();
  let processedFile = file;
  let metadata: FileWithMetadata['metadata'] = {};

  // HEIC 파일 처리
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
  if (isHeic) {
    try {
      // 변환 전에 원본 HEIC에서 메타데이터 추출
      metadata = await extractMetadata(file);
      console.log('HEIC metadata extracted:', metadata);

      // JPEG로 변환 (메타데이터는 손실됨)
      processedFile = await convertHeicToJpeg(file);

      // 변환된 파일의 실제 크기 업데이트
      const dimensions = await getImageDimensions(processedFile);
      if (dimensions && metadata) {
        metadata.width = dimensions.width;
        metadata.height = dimensions.height;
      }

      console.log('HEIC converted to JPEG, metadata preserved in FileWithMetadata object');
    } catch (_error) {
      return {
        id,
        file,
        status: 'error',
        error: 'HEIC 변환 실패',
      };
    }
  }

  const isImage = processedFile.type.startsWith('image/');
  const isVideo = processedFile.type.startsWith('video/');

  const fileWithMetadata: FileWithMetadata = {
    id,
    file: processedFile,
    preview: isImage || isVideo ? URL.createObjectURL(processedFile) : undefined,
    status: 'processing',
  };

  try {
    // 메타데이터 추출 (HEIC가 아닌 경우만)
    if (isImage && !isHeic) {
      metadata = await extractMetadata(processedFile);
      console.log({ metadata });
    }

    fileWithMetadata.metadata = metadata;

    // 이미지 최적화
    if (isImage) {
      const optimized = await compressImage(processedFile);

      const test = await extractMetadata(optimized);
      console.log('Optimized image metadata:', { test });

      fileWithMetadata.optimized = optimized;
    }

    fileWithMetadata.status = 'ready';
  } catch (error) {
    console.error('File processing failed:', error);
    fileWithMetadata.status = 'error';
    fileWithMetadata.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return fileWithMetadata;
}

/**
 * 여러 파일 처리
 */
export async function processFiles(files: File[]): Promise<FileWithMetadata[]> {
  return Promise.all(files.map((file) => processFile(file)));
}
