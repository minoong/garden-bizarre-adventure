/**
 * 트레이딩 시스템에서 공통으로 사용되는 색상 팔레트
 */
export const tradingColors = {
  /** 상승 (RISE) */
  rise: {
    main: '#c84a31',
    bg: 'rgba(200, 74, 49, 0.04)',
    light: 'rgba(200, 74, 49, 0.1)',
    bar: 'rgba(200, 74, 49, 0.12)',
  },
  /** 하락 (FALL) */
  fall: {
    main: '#1261c4',
    bg: 'rgba(18, 97, 196, 0.04)',
    light: 'rgba(18, 97, 196, 0.1)',
    bar: 'rgba(18, 97, 196, 0.12)',
  },
  /** 보합 (EVEN) / 중립 */
  neutral: {
    main: '#333',
    dark: '#000',
    light: 'rgba(0, 0, 0, 0.04)',
  },
} as const;

/**
 * 모드별 배경 및 레이아웃 색상
 */
export const layoutColors = {
  light: {
    background: '#f4f7fa',
    paper: '#ffffff',
    border: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#111111',
    textSecondary: '#666666',
  },
  dark: {
    background: '#17171c',
    paper: '#1e1e24',
    border: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#ffffff',
    textSecondary: '#999999',
  },
} as const;
