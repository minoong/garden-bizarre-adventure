import axios from 'axios';

import { BITHUMB_API_BASE_URL } from '../model/constants';

/**
 * 암호화폐 거래소 API Axios 인스턴스
 * 빗썸 V2 API (업비트 V2 API와 호환)
 */
export const bithumbClient = axios.create({
  baseURL: BITHUMB_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 응답 인터셉터 - 에러 처리
 */
bithumbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('[API Error]', message);
    }
    return Promise.reject(error);
  },
);
