'use client';

import { useState } from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import { signInWithGoogle, signInWithKakao } from '../lib/auth';

export function LoginButtons() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      alert('구글 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      await signInWithKakao();
    } catch (error) {
      console.error('Kakao login failed:', error);
      alert('카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
      <Button
        variant="outlined"
        size="large"
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={loading}
        fullWidth
      >
        구글로 로그인
      </Button>

      <Button
        variant="outlined"
        size="large"
        onClick={handleKakaoLogin}
        disabled={loading}
        fullWidth
        sx={{
          backgroundColor: '#FEE500',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#FDD835',
          },
          '&.Mui-disabled': {
            backgroundColor: '#FEE500',
            opacity: 0.5,
          },
        }}
      >
        {loading ? <CircularProgress size={20} /> : '카카오로 로그인'}
      </Button>
    </Stack>
  );
}
