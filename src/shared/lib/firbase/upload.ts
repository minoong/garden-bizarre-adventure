import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from 'firebase/storage';

import { storage } from './client';

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileUploadProgress {
  file: File;
  status: UploadStatus;
  progress: number;
  downloadURL?: string;
  error?: Error;
}

export interface FileUploadResult {
  file: File;
  status: UploadStatus;
  downloadURL?: string;
  error?: Error;
}

interface UploadOptions {
  /**
   * Storage path prefix (e.g., 'images/', 'documents/')
   * @default ''
   */
  path?: string;
  /**
   * Progress callback for each file
   */
  onProgress?: (fileProgress: FileUploadProgress[]) => void;
  /**
   * Custom file name generator
   */
  fileNameGenerator?: (file: File) => string;
}

/**
 * 여러 파일을 병렬로 Firebase Storage에 업로드합니다.
 * 각 파일은 독립적으로 처리되며, 하나의 파일이 실패해도 다른 파일 업로드에 영향을 주지 않습니다.
 *
 * @param files - 업로드할 파일 배열
 * @param options - 업로드 옵션
 * @returns 각 파일의 업로드 결과 배열
 *
 * @example
 * ```ts
 * const results = await uploadFiles(files, {
 *   path: 'images/',
 *   onProgress: (progress) => {
 *     console.log('Progress:', progress);
 *   }
 * });
 * ```
 */
export async function uploadFiles(files: File[], options: UploadOptions = {}): Promise<FileUploadResult[]> {
  const { path = '', onProgress, fileNameGenerator } = options;

  // 각 파일의 진행 상태를 추적
  const progressMap = new Map<File, FileUploadProgress>();

  // 초기 상태 설정
  files.forEach((file) => {
    progressMap.set(file, {
      file,
      status: 'pending',
      progress: 0,
    });
  });

  // 초기 상태 알림
  if (onProgress) {
    onProgress(Array.from(progressMap.values()));
  }

  // 각 파일에 대한 업로드 Promise 생성
  const uploadPromises = files.map((file) =>
    uploadSingleFile(file, path, fileNameGenerator, (progress) => {
      progressMap.set(file, progress);
      if (onProgress) {
        onProgress(Array.from(progressMap.values()));
      }
    }),
  );

  // 모든 파일을 병렬로 업로드 (Promise.allSettled로 개별 실패 처리)
  const results = await Promise.allSettled(uploadPromises);

  // 결과 변환
  return results.map((result, index) => {
    const file = files[index];
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        file,
        status: 'error' as const,
        error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
      };
    }
  });
}

/**
 * 단일 파일을 업로드하는 내부 함수
 */
async function uploadSingleFile(
  file: File,
  pathPrefix: string,
  fileNameGenerator?: (file: File) => string,
  onProgressUpdate?: (progress: FileUploadProgress) => void,
): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    try {
      // 파일명 생성
      const fileName = fileNameGenerator ? fileNameGenerator(file) : generateFileName(file);
      const fullPath = `${pathPrefix}${fileName}`;

      // Storage 참조 생성
      const storageRef = ref(storage, fullPath);

      // 업로드 태스크 생성
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

      // 업로드 상태 추적
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // 진행률 계산
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // 진행 상태 업데이트
          if (onProgressUpdate) {
            onProgressUpdate({
              file,
              status: 'uploading',
              progress,
            });
          }
        },
        (error) => {
          // 에러 처리
          const uploadError = new Error(`Failed to upload ${file.name}: ${error.message}`);

          if (onProgressUpdate) {
            onProgressUpdate({
              file,
              status: 'error',
              progress: 0,
              error: uploadError,
            });
          }

          reject(uploadError);
        },
        async () => {
          // 업로드 완료
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const result: FileUploadResult = {
              file,
              status: 'success',
              downloadURL,
            };

            if (onProgressUpdate) {
              onProgressUpdate({
                ...result,
                progress: 100,
              });
            }

            resolve(result);
          } catch (error) {
            const urlError = new Error(
              `Upload succeeded but failed to get download URL for ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
            );

            if (onProgressUpdate) {
              onProgressUpdate({
                file,
                status: 'error',
                progress: 100,
                error: urlError,
              });
            }

            reject(urlError);
          }
        },
      );
    } catch (error) {
      const initError = new Error(`Failed to initialize upload for ${file.name}: ${error instanceof Error ? error.message : String(error)}`);

      if (onProgressUpdate) {
        onProgressUpdate({
          file,
          status: 'error',
          progress: 0,
          error: initError,
        });
      }

      reject(initError);
    }
  });
}

/**
 * 기본 파일명 생성 함수 (타임스탬프 + 원본 파일명)
 */
function generateFileName(file: File): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  const baseName = file.name.replace(`.${extension}`, '');

  return `${timestamp}-${randomString}-${baseName}.${extension}`;
}
