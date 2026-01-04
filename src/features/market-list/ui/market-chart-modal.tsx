'use client';

import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';

import { D3CandlestickChart } from '@/features/upbit-chart/ui/d3-candlestick-chart';

interface MarketChartModalProps {
  /** 마켓 코드 */
  market: string | null;
  /** 열림 상태 */
  open: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 마켓 이름 */
  marketName?: string;
}

/**
 * 마켓 차트 모달 (D3 기반)
 */
export function MarketChartModal({ market, open, onClose, marketName }: MarketChartModalProps) {
  if (!market) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {marketName && <span>{marketName} </span>}
          <span style={{ color: '#999', fontSize: '0.875rem' }}>({market})</span>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <D3CandlestickChart
          market={market}
          timeframe={{ type: 'minutes', unit: 5 }}
          height={500}
          width={1000}
          initialCount={200}
          showGrid={true}
          showPriceAxis={true}
          showTimeAxis={true}
        />
      </DialogContent>
    </Dialog>
  );
}
