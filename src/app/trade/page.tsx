import type { Metadata } from 'next';

import { TradeLayout } from '@/widgets/trade-layout';

export const metadata: Metadata = {
  title: '거래소',
  description: '실시간 가상자산 시세 및 차트 서비스 - 빗썸 API 연동',
  openGraph: {
    title: '거래소 | Garden Bizarre Adventure',
    description: '실시간 가상자산 시세 및 차트 서비스 - 빗썸 API 연동',
  },
};

export default function TradePage() {
  return <TradeLayout initialMarket="KRW-BTC" />;
}
