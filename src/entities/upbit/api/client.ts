import axios from 'axios';

import { UPBIT_API_BASE_URL } from '../model/constants';

/**
 * 암호화폐 거래소 API Axios 인스턴스
 *
 * 참고: 빗썸 API 사용 (업비트 호환 엔드포인트)
 * - Rate limit 회피를 위해 빗썸 API 사용
 * - 업비트와 동일한 REST API 스펙 제공
 */
export const upbitClient = axios.create({
  baseURL: UPBIT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 응답 인터셉터 - 에러 처리
 */
upbitClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('[API Error]', message);
    }
    return Promise.reject(error);
  },
);
