'use client';

import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { Box, Typography, keyframes } from '@mui/material';
import { motion, useScroll, useTransform } from 'motion/react';

import { layoutColors, tradingColors } from '@/shared/config/colors';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-10px); }
  60% { transform: translateX(-50%) translateY(-5px); }
`;

export const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateDimensions = () => {
      const parent = containerRef.current;
      if (!parent) return;
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;
      createParticles();
    };

    let width = 0;
    let height = 0;

    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;
    }[] = [];

    const colors = [tradingColors.rise.main, tradingColors.fall.main, layoutColors.dark.textSecondary];

    const createParticles = () => {
      particles.length = 0;
      const particleCount = Math.min(Math.floor(width * 0.05), 50);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    updateDimensions();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    let isVisible = true;
    const ticker = () => {
      if (isVisible) draw();
    };

    gsap.ticker.add(ticker);

    const handleResize = () => {
      updateDimensions();
    };

    // Intersection Observer to pause animation when out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    if (textRef.current) {
      gsap.fromTo(
        textRef.current.querySelectorAll('.hero-char'),
        {
          opacity: 0,
          y: 60,
          rotateX: -90,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          stagger: 0.03,
          duration: 1.2,
          ease: 'power4.out',
          force3D: true,
        },
      );
    }

    return () => {
      gsap.ticker.remove(ticker);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const title = 'Garden Bizarre Adventure';
  const characters = useMemo(() => title.split(''), []);

  const { scrollYProgress } = useScroll();

  // Parallax transforms focused on the first 100vh of scroll
  // Assuming total page height is around 500vh-600vh, 0.2 is roughly the first screen
  const backgroundScale = useTransform(scrollYProgress, [0, 0.2], [1, 3.0]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]); // Fades out faster
  const contentY = useTransform(scrollYProgress, [0, 0.25], [0, -600]);
  const contentScale = useTransform(scrollYProgress, [0, 0.25], [1, 2.0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]); // Fades out even faster than background
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2]);

  return (
    <Box
      ref={containerRef}
      component={motion.div}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: layoutColors.dark.textPrimary,
        // Remove backgroundColor here as it was covering z-index: -1 children
      }}
    >
      {/* Background layer with black base */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: '#000',
          zIndex: -2,
        }}
      />

      {/* Background Image with Parallax Scale & Fade */}
      <Box
        component={motion.div}
        style={{
          scale: backgroundScale,
          opacity: backgroundOpacity,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/logo.webp')`,
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundSize: { xs: 'cover', md: 'contain' },
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
        }}
      />

      <Box
        component={motion.canvas}
        ref={canvasRef}
        style={{
          opacity: canvasOpacity,
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      <Box
        ref={textRef}
        component={motion.div}
        style={{
          y: contentY,
          scale: contentScale,
          opacity: contentOpacity,
        }}
        sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 2 }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 'clamp(2rem, 8vw, 5rem)', md: 'clamp(3rem, 10vw, 6rem)' },
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.2rem',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.1,
            perspective: '1000px', // For 3D rotation
          }}
        >
          {characters.map((char, i) => (
            <span
              key={i}
              className="hero-char"
              style={{
                display: 'inline-block',
                backfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </Typography>

        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          sx={{ mt: 4 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(0.9rem, 2vw, 1.4rem)',
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            히사시부리!
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: `${bounce} 2s infinite`,
        }}
      >
        <Box sx={{ width: 20, height: 35, border: `2px solid ${layoutColors.dark.textSecondary}`, opacity: 0.5, borderRadius: 10, position: 'relative' }}>
          <Box
            sx={{
              width: 4,
              height: 4,
              bgcolor: tradingColors.rise.main,
              borderRadius: '50%',
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
