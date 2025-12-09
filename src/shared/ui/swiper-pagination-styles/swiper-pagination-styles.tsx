'use client';

import { GlobalStyles } from '@mui/material';

interface SwiperPaginationStylesProps {
  className?: string;
  bulletSize?: number;
  bulletSpacing?: number;
  bulletColor?: string;
  activeBulletColor?: string;
  activeScale?: number;
  containerBgColor?: string;
  containerPadding?: string;
  containerBorderRadius?: string;
}

export function SwiperPaginationStyles({
  className = 'custom-swiper',
  bulletSize = 3,
  bulletSpacing = 2,
  bulletColor = 'rgba(255, 255, 255, 0.4)',
  activeBulletColor = 'rgba(0, 123, 255, 1)',
  activeScale = 1.5,
  containerBgColor = 'rgba(0, 0, 0, 0.2)',
  containerPadding = '3px 6px',
  containerBorderRadius = '8px',
}: SwiperPaginationStylesProps) {
  return (
    <GlobalStyles
      styles={{
        [`.${className} .swiper-pagination`]: {
          width: 'auto !important',
          left: '50% !important',
          transform: 'translateX(-50%) !important',
          background: `${containerBgColor} !important`,
          backdropFilter: 'blur(4px) !important',
          padding: `${containerPadding} !important`,
          borderRadius: `${containerBorderRadius} !important`,
          display: 'inline-flex !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
        },
        [`.${className} .swiper-pagination-bullet`]: {
          width: `${bulletSize}px !important`,
          height: `${bulletSize}px !important`,
          background: `${bulletColor} !important`,
          opacity: '1 !important',
          margin: `0 ${bulletSpacing}px !important`,
          transition: 'all 0.3s !important',
          display: 'inline-block !important',
        },
        [`.${className} .swiper-pagination-bullet-active`]: {
          background: `${activeBulletColor} !important`,
          transform: `scale(${activeScale}) !important`,
        },
      }}
    />
  );
}
