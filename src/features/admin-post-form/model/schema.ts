import { z } from 'zod';

/**
 * 위치 정보 스키마
 */
export const locationSchema = z
  .object({
    locationName: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine(
    (data) => {
      // latitude와 longitude는 둘 다 있거나 둘 다 없어야 함
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    {
      message: '위도와 경도는 함께 입력해야 합니다',
      path: ['latitude'],
    },
  );

/**
 * 날짜 범위 스키마
 */
export const dateRangeSchema = z
  .object({
    dateFrom: z.date(),
    dateTo: z.date(),
  })
  .refine((data) => data.dateFrom <= data.dateTo, {
    message: '시작 날짜는 종료 날짜보다 이전이어야 합니다',
    path: ['dateFrom'],
  });

/**
 * 태그 스키마
 */
export const tagsSchema = z
  .array(z.string().min(1, '태그는 1글자 이상이어야 합니다').max(50, '태그는 50글자 이하여야 합니다'))
  .max(20, '태그는 최대 20개까지 추가할 수 있습니다')
  .optional();

/**
 * 어드민 게시물 폼 스키마
 */
export const adminPostFormSchema = z
  .object({
    // 기본 정보
    title: z.string().max(200, '제목은 200자 이하여야 합니다').optional(),
    content: z.string().max(5000, '내용은 5000자 이하여야 합니다').optional(),
    theme: z
      .array(z.string().min(1, '테마는 1글자 이상이어야 합니다').max(50, '테마는 50자 이하여야 합니다'))
      .max(10, '테마는 최대 10개까지 선택할 수 있습니다')
      .optional(),
    isPublic: z.boolean().optional(),

    // 위치 정보
    locationName: z.string().max(200, '장소명은 200자 이하여야 합니다').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // 날짜 범위
    dateFrom: z.date(),
    dateTo: z.date(),

    // 태그
    tags: tagsSchema,

    // 파일 관련 (폼 검증에서는 제외, 별도 상태로 관리)
    // files, selectedFileIds는 React 상태로만 관리
  })
  .refine(
    (data) => {
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    {
      message: '위도와 경도는 함께 입력해야 합니다',
      path: ['latitude'],
    },
  )
  .refine((data) => data.dateFrom <= data.dateTo, {
    message: '시작 날짜는 종료 날짜보다 이전이어야 합니다',
    path: ['dateFrom'],
  });

/**
 * 폼 데이터 타입 추론
 */
export type AdminPostFormValues = z.infer<typeof adminPostFormSchema>;
