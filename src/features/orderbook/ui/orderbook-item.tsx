import { memo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

import { formatPrice, formatChangeRate } from '@/entities/bithumb';

interface OrderbookItemProps {
  type: 'ASK' | 'BID';
  price: number;
  size: number;
  changeRate: number;
  maxSize: number;
  /** 현재가 여부 */
  isCurrentPrice?: boolean;
}

export const OrderbookItem = memo(function OrderbookItem({ type, price, size, changeRate, maxSize, isCurrentPrice }: OrderbookItemProps) {
  const theme = useTheme();
  const isAsk = type === 'ASK';

  // 테마에서 중앙화된 트레이딩 색상 가져오기
  const trading = theme.palette.trading;
  const colors = isAsk ? trading.fall : trading.rise; // ASK는 매도(보통 파랑/하락색), BID는 매수(보통 빨강/상승색)

  const color = colors.main;
  const bgColor = colors.bg;
  const barColor = colors.bar;

  // Bar scale (0 to 1)
  const barScale = maxSize > 0 ? size / maxSize : 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr 1fr', // Column 1: Ask Vol | Col 2: Price | Col 3: Bid Vol
        height: 30,
        alignItems: 'center',
        bgcolor: bgColor,
        fontSize: '11px',
        borderBottom: '1px solid rgba(0,0,0,0.02)',
        cursor: 'pointer',
        transition: 'all 0.1s ease-in-out',
        '&:hover': {
          bgcolor: isAsk ? 'rgba(18, 97, 196, 0.12)' : 'rgba(200, 74, 49, 0.12)',
          filter: 'brightness(0.94)',
        },
      }}
    >
      {/* Column 1: Ask Volume (Only for Asks - Aligned Right) */}
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1, overflow: 'hidden' }}>
        {isAsk && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '100%',
                bgcolor: barColor,
                transform: `scaleX(${barScale})`,
                transformOrigin: 'right',
                transition: 'transform 0.1s ease-out',
                willChange: 'transform',
                zIndex: 0,
              }}
            />
            <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, letterSpacing: '-0.3px', color: 'text.secondary', fontWeight: 500 }}>
              {size}
            </Typography>
          </>
        )}
      </Box>

      {/* Column 2: Price & Chg% (Static Text in Center) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          height: '100%',
          borderLeft: '1px solid rgba(0,0,0,0.04)',
          borderRight: '1px solid rgba(0,0,0,0.04)',
          position: 'relative',
          zIndex: isCurrentPrice ? 3 : 2,
          bgcolor: 'inherit',
          ...(isCurrentPrice && {
            outline: '2.4px solid #333',
            outlineOffset: '-2.4px',
            zIndex: 10,
            borderRadius: '1px',
          }),
        }}
      >
        <Typography variant="body2" sx={{ color, fontSize: '12px', letterSpacing: '-0.2px', fontWeight: 800 }}>
          {formatPrice(price)}
        </Typography>
        <Typography variant="caption" sx={{ color, fontSize: '10px', opacity: 0.9, fontWeight: 700 }}>
          {formatChangeRate(changeRate)}
        </Typography>
      </Box>

      {/* Column 3: Bid Volume (Only for Bids - Aligned Left) */}
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pl: 1, overflow: 'hidden' }}>
        {!isAsk && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: barColor,
                transform: `scaleX(${barScale})`,
                transformOrigin: 'left',
                transition: 'transform 0.1s ease-out',
                willChange: 'transform',
                zIndex: 0,
              }}
            />
            <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, letterSpacing: '-0.3px', color: 'text.secondary', fontWeight: 500 }}>
              {size}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
});
