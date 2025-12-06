'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Portal, Typography, useTheme } from '@mui/material';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import { CommentInput } from '@/features/comment/ui/comment-input';
import { CommentList } from '@/features/comment/ui/comment-list';

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function CommentSheet({ isOpen, onClose, postId }: CommentSheetProps) {
  const snapPoints = [0, 0.7, 1];

  const ref = useRef<SheetRef>(null);
  const [, setSnapPoint] = useState(1);
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const [viewportHeightight, setViewportHeight] = useState(0);

  const theme = useTheme();

  const updateViewportHeight = useCallback(() => {
    if (window.visualViewport) {
      if (window.visualViewport.height !== window.document.documentElement.clientHeight) {
        snapTo(2);
      }

      setViewportHeight(window.visualViewport.height);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateViewportHeight();

    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', updateViewportHeight);
      viewport.addEventListener('scroll', updateViewportHeight);

      return () => {
        viewport.removeEventListener('resize', updateViewportHeight);
        viewport.removeEventListener('scroll', updateViewportHeight);
        setViewportHeight(0);
      };
    }
  }, [isOpen, updateViewportHeight]);

  return (
    <>
      <Sheet ref={ref} isOpen={isOpen} onSnap={setSnapPoint} onClose={onClose} snapPoints={snapPoints} initialSnap={1}>
        <Sheet.Container
          style={{
            backgroundColor: '#111',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            paddingBottom: '100px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Sheet.Header
            style={{
              backgroundColor: '#111',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2,
                position: 'relative',
              }}
            >
              {/* 드래그 핸들 */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  width: 40,
                  height: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                }}
              />
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mt: 2 }}>
                댓글
              </Typography>
            </Box>
          </Sheet.Header>
          <Sheet.Content
            disableDrag
            style={{
              backgroundColor: '#111',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <CommentList postId={postId} />
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop
          onTap={onClose}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        />
      </Sheet>

      {isOpen && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              bottom: `calc(100% - ${viewportHeightight}px)`,
              left: 0,
              right: 0,
              bgcolor: '#111',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: theme.zIndex.modal + 9999,
              maxWidth: '100vw',
            }}
          >
            <CommentInput postId={postId} />
          </Box>
        </Portal>
      )}
    </>
  );
}
