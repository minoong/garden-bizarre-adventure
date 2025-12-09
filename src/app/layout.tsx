import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import Script from 'next/script';

import theme from './theme';
import { AuthProvider, QueryClientProvider } from './providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Garden Bizarre Adventure',
    default: 'Garden Bizarre Adventure',
  },
  description: '소셜 미디어 플랫폼',
  openGraph: {
    title: {
      template: '%s | Garden Bizarre Adventure',
      default: 'Garden Bizarre Adventure',
    },
    description: '소셜 미디어 플랫폼',
    siteName: 'Garden Bizarre Adventure',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s | Garden Bizarre Adventure',
      default: 'Garden Bizarre Adventure',
    },
    description: '소셜 미디어 플랫폼',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
          <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`} strategy="beforeInteractive" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
