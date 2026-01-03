import axios from 'axios';

import { UPBIT_API_BASE_URL } from '../model/constants';

/**
 * 업비트 API Axios 인스턴스
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
      console.error('[Upbit API Error]', message);
    }
    return Promise.reject(error);
  },
);
