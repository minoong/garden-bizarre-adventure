'use client';

import { Box, Typography, Paper } from '@mui/material';

import { LoginButtons } from '@/features/auth/ui';
import { useAuth } from '@/app/providers';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            로그인 성공
          </Typography>
          <Typography>이메일: {user.email}</Typography>
          <Typography>ID: {user.id}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          로그인
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          소셜 계정으로 간편하게 로그인하세요
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LoginButtons />
        </Box>
      </Paper>
    </Box>
  );
}
