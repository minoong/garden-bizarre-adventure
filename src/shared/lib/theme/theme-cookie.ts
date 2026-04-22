export type AppThemeMode = 'light' | 'dark';
export type AppThemeSetting = AppThemeMode | 'system';

export const THEME_COOKIE_NAME = 'theme';

export function parseTheme(value?: string | null): AppThemeMode | null {
  if (value === 'dark' || value === 'light') {
    return value;
  }

  return null;
}

export function normalizeTheme(value?: string | null): AppThemeMode {
  return parseTheme(value) ?? 'light';
}

export function createThemeCookie(theme: AppThemeMode): string {
  return `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function getThemeInitScript() {
  return `
    (() => {
      const cookieName = '${THEME_COOKIE_NAME}';
      const cookieMatch = document.cookie.match(new RegExp('(?:^|; )' + cookieName + '=([^;]+)'));
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = cookieTheme === 'dark' || cookieTheme === 'light' ? cookieTheme : systemTheme;
      const root = document.documentElement;

      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;

      if (!cookieTheme) {
        document.cookie = '${createThemeCookie('light')}'.replace('light', theme);
      }
    })();
  `;
}
