'use client';

import { ReactLenis } from 'lenis/react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time: number) {
      // @ts-expect-error - lenis types are not perfect
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
