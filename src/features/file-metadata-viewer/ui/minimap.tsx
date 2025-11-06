'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useTransformContext, useTransformEffect, useTransformInit } from 'react-zoom-pan-pinch';
import { Box } from '@mui/material';

import { useResizeObserver } from '@/shared/model/observer/use-resize-observer';

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
  width?: number;
  height?: number;
  borderColor?: string;
}

export function MiniMap(props: Props) {
  const { width = 100, height = 100, borderColor = 'blue', children, ...rest } = props;

  const [initialized, setInitialized] = useState(false);
  const instance = useTransformContext();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const getViewportSize = useCallback(() => {
    if (instance.wrapperComponent) {
      const rect = instance.wrapperComponent.getBoundingClientRect();

      return {
        width: rect.width,
        height: rect.height,
      };
    }
    return {
      width: 0,
      height: 0,
    };
  }, [instance.wrapperComponent]);

  const getContentSize = useCallback(() => {
    if (instance.contentComponent) {
      const rect = instance.contentComponent.getBoundingClientRect();

      return {
        width: rect.width / instance.transformState.scale,
        height: rect.height / instance.transformState.scale,
      };
    }
    return {
      width: 0,
      height: 0,
    };
  }, [instance.contentComponent, instance.transformState.scale]);

  const computeMiniMapScale = useCallback(() => {
    const contentSize = getContentSize();
    const scaleX = width / contentSize.width;
    const scaleY = height / contentSize.height;
    const scale = scaleY > scaleX ? scaleX : scaleY;

    return scale;
  }, [getContentSize, height, width]);

  const computeMiniMapSize = () => {
    const contentSize = getContentSize();
    const scaleX = width / contentSize.width;
    const scaleY = height / contentSize.height;
    if (scaleY > scaleX) {
      return { width, height: contentSize.height * scaleX };
    }
    return { width: contentSize.width * scaleY, height };
  };

  const transformMiniMap = () => {
    const miniSize = computeMiniMapSize();
    const wrapSize = getContentSize();
    const scale = computeMiniMapScale();

    if (wrapperRef.current) {
      wrapperRef.current.style.width = `${wrapSize.width}px`;
      wrapperRef.current.style.height = `${wrapSize.height}px`;
      wrapperRef.current.style.transform = `scale(${scale || 1})`;
      wrapperRef.current.style.transformOrigin = '0% 0%';
    }
    if (mainRef.current) {
      mainRef.current.style.width = `${miniSize.width}px`;
      mainRef.current.style.height = `${miniSize.height}px`;
    }
    if (previewRef.current) {
      const size = getViewportSize();
      const previewScale = scale * (1 / instance.transformState.scale);
      const x = -instance.transformState.positionX * previewScale;
      const y = -instance.transformState.positionY * previewScale;

      previewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
      previewRef.current.style.width = `${size.width * previewScale}px`;
      previewRef.current.style.height = `${size.height * previewScale}px`;
    }
  };

  useTransformEffect(() => {
    transformMiniMap();
  });

  useTransformInit(() => {
    setInitialized(true);
  });

  useResizeObserver(instance.contentComponent, transformMiniMap, [initialized]);

  return (
    <Box ref={mainRef} sx={{ position: 'relative', zIndex: 2, overflow: 'hidden' }} {...rest}>
      <Box
        ref={wrapperRef}
        sx={{
          position: 'absolute',
          zIndex: 1,
          overflow: 'hidden',
          boxSizing: 'border-box',
          transformOrigin: '0% 0%',
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 2,
          top: '0px',
          left: '0px',
          boxSizing: 'border-box',
          border: '1px dotted #029cfd',
          transformOrigin: '0% 0%',
          boxShadow: 'rgba(0,0,0,0.2) 0 0 0 10000000px',
          borderColor,
        }}
        ref={previewRef}
      />
    </Box>
  );
}
