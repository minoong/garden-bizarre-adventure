'use client';

import { Hero } from '@/widgets/hero/ui';

export function HomeHero() {
  return (
    <Hero>
      <Hero.Background src="/images/logo.webp" />

      <Hero.TextPanel
        text="이세계로 떨어진 줄 알았더니… 사실은 여행이었다!?"
        scrollRange={{
          opacity: [0, 0.1, 0.2],
          scale: [0, 0.1],
          opacityValues: [1, 0, 0],
          scaleValues: [1, 0.5],
        }}
        position={{
          top: { xs: '25%', md: '30%' },
          left: { xs: '10%', md: '15%' },
        }}
        rotate="10deg"
        textAlign="left"
      />

      <Hero.TextPanel
        text="너랑 함께라면, 지도의 점이… 추억으로 빛난다."
        scrollRange={{
          opacity: [0.15, 0.2, 0.35, 0.4],
          scale: [0.15, 0.2, 0.4],
          opacityValues: [0, 1, 1, 0],
          scaleValues: [0.5, 1, 0.5],
        }}
        position={{
          top: { xs: '50%', md: '55%' },
          right: { xs: '10%', md: '15%' },
        }}
        rotate="-10deg"
        textAlign="right"
      />

      <Hero.TextPanel
        text="왼쪽엔 절경, 오른쪽엔 츤데레… 선택은 네 몫!"
        scrollRange={{
          opacity: [0.35, 0.4, 0.55, 0.85],
          scale: [0.35, 0.4, 0.85],
          opacityValues: [0, 1, 1, 0],
          scaleValues: [0.5, 1, 0.5],
        }}
        position={{
          top: { xs: '35%', md: '40%' },
          left: { xs: '50%', md: '50%' },
        }}
        textAlign="center"
      />

      <Hero.TextPanel
        text="다음 여행지는… 아직 아무도 모른다. (두근)"
        scrollRange={{
          opacity: [0.55, 0.6, 0.75, 0.85],
          scale: [0.55, 0.6, 0.8],
          opacityValues: [0, 1, 1, 0],
          scaleValues: [0.5, 1, 0.5],
        }}
        position={{
          top: { xs: '60%', md: '65%' },
          left: { xs: '10%', md: '20%' },
        }}
        rotate="-5deg"
        textAlign="left"
      />

      <Hero.ActionButton>여행 시작하기</Hero.ActionButton>
    </Hero>
  );
}
