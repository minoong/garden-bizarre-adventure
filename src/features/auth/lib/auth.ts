import { supabase } from '@/shared/lib/supabase/client';

type OAuthProvider = 'google' | 'kakao';

/**
 * OAuth 로그인 (구글, 카카오)
 */
export async function signInWithOAuth(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(`${provider} login error:`, error);
    throw error;
  }

  return data;
}

/**
 * 구글 로그인
 */
export async function signInWithGoogle() {
  return signInWithOAuth('google');
}

/**
 * 카카오 로그인
 */
export async function signInWithKakao() {
  return signInWithOAuth('kakao');
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error);
    throw error;
  }

  return user;
}

/**
 * 현재 세션 정보 가져오기
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Get session error:', error);
    throw error;
  }

  return session;
}
