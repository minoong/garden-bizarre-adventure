import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';

import { AuthProvider, QueryClientProvider, MUIProvider } from './providers';

import './globals.css';

const notoSansKr = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    <html lang="ko">
      <body className={`${notoSansKr.variable} antialiased`}>
        <QueryClientProvider>
          <MUIProvider>
            <AuthProvider>{children}</AuthProvider>
          </MUIProvider>
          <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`} strategy="beforeInteractive" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
