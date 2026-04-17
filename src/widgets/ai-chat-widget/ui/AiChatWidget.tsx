'use client';

import { useState } from 'react';
import { Box, Fab, Paper, Typography, IconButton } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon, SmartToy as RobotIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';

/**
 * AI Chat Widget Component
 * Provides a floating toggle button and a sliding chat interface.
 */
export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              marginBottom: 16,
              width: '400px',
              maxWidth: 'calc(100vw - 48px)',
              height: '600px',
              maxHeight: 'calc(100vh - 120px)',
            }}
          >
            <Paper
              elevation={24}
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <RobotIcon />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      Bizarre AI Assistant
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      실시간 거래 및 데이터 분석 도와드려요
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Chat Content Area (Placeholder for AI SDK / Elements) */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'background.default' }}>
                <Typography color="text.secondary" sx={{ mt: 10, textAlign: 'center' }}>
                  안녕하세요! 무엇을 도와드릴까요?
                  <br />
                  (AI-SDK 적용 예정 영역)
                </Typography>
              </Box>

              {/* Input Area Placeholder */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                  }}
                >
                  메시지를 입력하세요...
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} initial={false} animate={isOpen ? { rotate: 90 } : { rotate: 0 }}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={toggleChat}
          sx={{
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
            transition: 'all 0.3s ease',
            ...(isOpen && {
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }),
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </motion.div>
    </Box>
  );
};
