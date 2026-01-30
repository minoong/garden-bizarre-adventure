'use client';

import { Box } from '@mui/material';
import { useMotionValue } from 'motion/react';
import dynamic from 'next/dynamic';

import { LayoutProvider } from '@/app/providers';
import { HeroParticles } from '@/widgets/hero';
import { ScrollSection } from '@/shared/ui/scroll-section';
import { layoutColors } from '@/shared/config/colors';

// Dynamic imports for heavy sections
const TradeSection = dynamic(() => import('@/widgets/home-sections').then((m) => m.TradeSection), {
  ssr: false,
  loading: () => <Box sx={{ height: 500, bgcolor: layoutColors.dark.paper, opacity: 0.5, borderRadius: 4 }} />,
});

const PostsHorizontalGallery = dynamic(() => import('@/widgets/home-sections').then((m) => m.PostsHorizontalGallery), {
  ssr: false,
  loading: () => <Box sx={{ height: '400vh' }} />,
});

export default function Home() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only track mouse for hero section area or when near top
    if (typeof window !== 'undefined' && window.scrollY < window.innerHeight) {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize to -0.5 to 0.5
      const nextX = clientX / innerWidth - 0.5;
      const nextY = clientY / innerHeight - 0.5;

      // Sub-pixel threshold to avoid tiny updates
      if (Math.abs(x.get() - nextX) > 0.01 || Math.abs(y.get() - nextY) > 0.01) {
        x.set(nextX);
        y.set(nextY);
      }
    }
  };

  return (
    <LayoutProvider>
      <Box
        onMouseMove={handleMouseMove}
        sx={{
          bgcolor: layoutColors.dark.background,
          color: layoutColors.dark.textPrimary,
        }}
      >
        {/* Section 1: Hero (Fixed behind) */}
        <Box
          sx={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              zIndex: 0,
            }}
          >
            <HeroParticles />
          </Box>
        </Box>

        {/* Section 2: Trade */}
        <Box sx={{ position: 'relative', zIndex: 10, bgcolor: layoutColors.dark.background }}>
          <ScrollSection
            title="트레이딩 시작하기"
            description="실시간 마켓 시세를 확인하고 빠른 거래를 경험하세요. 비트코인, 이더리움 등 다양한 자산을 한눈에 모니터링할 수 있습니다."
            variant="stacked"
            fullWidth
            background={`linear-gradient(180deg, ${layoutColors.dark.background} 0%, ${layoutColors.dark.paper} 100%)`}
          >
            <TradeSection />
          </ScrollSection>
        </Box>

        {/* Section 3: Posts (Horizontal Gallery) */}
        <Box sx={{ position: 'relative', zIndex: 11, bgcolor: '#000' }}>
          <PostsHorizontalGallery />
        </Box>
      </Box>
    </LayoutProvider>
  );
}
