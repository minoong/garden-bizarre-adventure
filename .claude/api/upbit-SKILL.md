# Upbit API 사용 가이드

이 스킬은 **Upbit API** 엔티티 및 차트 컴포넌트 사용 방법을 정의합니다.

## 📁 디렉토리 구조

```
src/
├── entities/upbit/              # Upbit API 엔티티
│   ├── api/
│   │   ├── client.ts            # Axios 클라이언트
│   │   ├── markets.ts           # 마켓 목록 API
│   │   ├── ticker.ts            # 현재가 API
│   │   └── candles.ts           # 캔들 데이터 API
│   ├── model/
│   │   ├── types.ts             # TypeScript 타입 정의
│   │   ├── constants.ts         # 상수 (API URL, Query Keys 등)
│   │   ├── store.ts             # Zustand 스토어 (WebSocket)
│   │   └── websocket-types.ts   # WebSocket 타입
│   ├── hooks/
│   │   ├── use-markets.ts       # useKrwMarkets 등
│   │   ├── use-ticker.ts        # useTicker 등
│   │   ├── use-candles.ts       # useCandles 등
│   │   └── use-upbit-socket.ts  # WebSocket 훅
│   └── lib/
│       ├── format.ts            # parseMarketCode, getMarketLabel 등
│       └── websocket-manager.ts # WebSocket 매니저
│
└── features/upbit-chart/        # 차트 기능
    ├── ui/
    │   ├── candlestick-chart.tsx
    │   └── candlestick-chart.stories.tsx
    ├── model/
    │   └── types.ts             # 차트 옵션 타입
    └── lib/
        └── transform.ts         # 데이터 변환 (toChartCandles 등)
```

## 🔑 API 명세 개요

### 공통 사항

- **Base URL**: `https://api.upbit.com`
- **인증**: Public API는 인증 불필요
- **응답 형식**: JSON
- **시간 형식**: ISO 8601 (`yyyy-MM-ddTHH:mm:ss`)

### 지원 API

| API       | 엔드포인트                         | 설명                |
| --------- | ---------------------------------- | ------------------- |
| 마켓 목록 | `GET /v1/market/all`               | 전체 마켓 조회      |
| 현재가    | `GET /v1/ticker`                   | 실시간 시세 조회    |
| 분봉 캔들 | `GET /v1/candles/minutes/{unit}`   | 1, 3, 5, ..., 240분 |
| 일봉 캔들 | `GET /v1/candles/days`             | 일봉                |
| 주봉 캔들 | `GET /v1/candles/weeks`            | 주봉                |
| 월봉 캔들 | `GET /v1/candles/months`           | 월봉                |
| WebSocket | `wss://api.upbit.com/websocket/v1` | 실시간 데이터       |

## 📊 캔들 데이터 API

### 분봉 조회

```typescript
import { fetchMinuteCandles } from '@/entities/upbit';

const candles = await fetchMinuteCandles('KRW-BTC', 5, {
  count: 200,
  to: '2026-01-02T14:00:00', // Optional: 특정 시점 이전 데이터
});
```

**중요 파라미터**:

- `market`: 마켓 코드 (예: `KRW-BTC`)
- `unit`: 분 단위 (1, 3, 5, 10, 15, 30, 60, 240 중 하나)
- `count`: 개수 (최대 200개)
- `to`: 마지막 캔들 시각 (생략 시 최신 데이터)

### 통합 캔들 조회 함수

```typescript
import { fetchCandles } from '@/entities/upbit';
import type { CandleTimeframe } from '@/entities/upbit';

// 분봉
const timeframe: CandleTimeframe = { type: 'minutes', unit: 15 };
const candles = await fetchCandles('KRW-BTC', timeframe, { count: 100 });

// 일봉
const timeframe2: CandleTimeframe = { type: 'days' };
const candles2 = await fetchCandles('KRW-BTC', timeframe2, { count: 30 });
```

### TanStack Query 훅 사용

```typescript
import { useCandles } from '@/entities/upbit';

function MyChart() {
  const { data: candles, isLoading, error } = useCandles(
    'KRW-BTC',
    { type: 'minutes', unit: 5 },
    { count: 200 }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{candles?.length} candles loaded</div>;
}
```

## 🏷️ 마켓 데이터

### 전체 마켓 조회

```typescript
import { useMarkets } from '@/entities/upbit';

const { data: markets } = useMarkets();
// Market[] 타입: { market: 'KRW-BTC', korean_name: '비트코인', english_name: 'Bitcoin' }
```

### KRW 마켓만 조회

```typescript
import { useKrwMarkets } from '@/entities/upbit';

const { data: krwMarkets, isLoading } = useKrwMarkets();
// KRW로 시작하는 마켓만 필터링
```

### 마켓 라벨 생성

```typescript
import { getMarketLabel } from '@/entities/upbit';
import type { Market } from '@/entities/upbit';

const market: Market = {
  market: 'KRW-BTC',
  korean_name: '비트코인',
  english_name: 'Bitcoin',
};

const label = getMarketLabel(market);
// "비트코인 (BTC/KRW)"
```

## 📈 차트 컴포넌트 사용

### CandlestickChart 기본 사용

```typescript
import { CandlestickChart } from '@/features/upbit-chart/ui';

<CandlestickChart
  market="KRW-BTC"
  timeframe={{ type: 'minutes', unit: 15 }}
  options={{
    height: 500,
    darkMode: true,
    showVolume: true,
  }}
/>
```

### 실시간 업데이트

```typescript
<CandlestickChart
  market="KRW-BTC"
  timeframe={{ type: 'minutes', unit: 1 }}
  realtime={true}  // WebSocket 실시간 업데이트
  options={{ height: 500 }}
/>
```

**중요**: 실시간 업데이트는 **분봉에서만** 작동합니다. 일봉/주봉/월봉은 지원하지 않습니다.

### 무한 스크롤 (과거 데이터 로드)

```typescript
<CandlestickChart
  market="KRW-BTC"
  timeframe={{ type: 'days' }}
  infiniteScroll={true}  // 왼쪽으로 드래그 시 과거 데이터 로드
  initialCount={100}     // 초기 로드 개수
  options={{ height: 600 }}
/>
```

**동작 방식**:

1. 차트를 왼쪽으로 드래그
2. 왼쪽 끝 10개 바 이내 도달 시 자동으로 100개 추가 로드
3. `to` parameter를 사용해 중복 없이 과거 데이터 로드

### 타임존 처리 (중요!)

**문제**: `candle_date_time_kst`는 타임존 정보가 없어서 로컬 시간으로 해석될 수 있습니다.

**해결**: `getPreviousCandleTime` 및 `parseKstToTimestamp` 함수 사용

```typescript
// src/features/upbit-chart/lib/transform.ts

// ✅ DO: KST 타임존 명시
function parseKstToTimestamp(kstDateString: string): number {
  return Math.floor(new Date(kstDateString + '+09:00').getTime() / 1000);
}

// ✅ DO: 타임프레임 단위만큼 이전 시간 계산
export function getPreviousCandleTime(kstDateString: string, timeframe: CandleTimeframe): string {
  const date = new Date(kstDateString + '+09:00');

  if (timeframe.type === 'minutes') {
    date.setMinutes(date.getMinutes() - timeframe.unit);
  } else if (timeframe.type === 'days') {
    date.setDate(date.getDate() - 1);
  }
  // ...

  return date.toISOString().slice(0, 19); // 'yyyy-MM-ddTHH:mm:ss'
}
```

**사용 예시** (무한 스크롤):

```typescript
const oldestCandleTime = allCandles[allCandles.length - 1].candle_date_time_kst;
const toParam = getPreviousCandleTime(oldestCandleTime, timeframe);

const moreCandles = await fetchCandles(market, timeframe, {
  to: toParam, // ✅ 중복 방지를 위해 1 단위 이전 시간 사용
  count: 100,
});
```

## 🔌 WebSocket 실시간 데이터

### useUpbitSocket 훅

```typescript
import { useUpbitSocket } from '@/entities/upbit';

function RealtimeTicker() {
  const { candles, status } = useUpbitSocket(
    ['KRW-BTC', 'KRW-ETH'],  // 구독할 마켓
    ['candle'],              // 구독 타입 (ticker, orderbook, candle)
    {
      autoConnect: true,
      candleType: 'candle.1m',  // 1분봉
    }
  );

  const btcCandle = candles.get('KRW-BTC');

  return (
    <div>
      Status: {status}
      {btcCandle && <div>BTC: {btcCandle.trade_price}</div>}
    </div>
  );
}
```

### 지원 캔들 타입

| 타입          | 설명    |
| ------------- | ------- |
| `candle.1m`   | 1분봉   |
| `candle.3m`   | 3분봉   |
| `candle.5m`   | 5분봉   |
| `candle.10m`  | 10분봉  |
| `candle.15m`  | 15분봉  |
| `candle.30m`  | 30분봉  |
| `candle.60m`  | 60분봉  |
| `candle.240m` | 240분봉 |

## 🚫 Anti-patterns (금지 사항)

### ❌ 타임존 누락

```typescript
// ❌ DON'T: 타임존 정보 없이 변환
const timestamp = new Date(candle.candle_date_time_kst).getTime();
// 로컬 타임존으로 해석되어 잘못된 시간!

// ✅ DO: KST 타임존 명시
const timestamp = new Date(candle.candle_date_time_kst + '+09:00').getTime();
```

### ❌ 중복 데이터 미처리

```typescript
// ❌ DON'T: to parameter 그대로 사용
const oldestTime = candles[candles.length - 1].candle_date_time_kst;
const more = await fetchCandles(market, timeframe, {
  to: oldestTime, // ❌ API가 inclusive이므로 중복 발생!
});

// ✅ DO: 1 단위 이전 시간 사용
const toParam = getPreviousCandleTime(oldestTime, timeframe);
const more = await fetchCandles(market, timeframe, {
  to: toParam, // ✅ 중복 없음
});
```

### ❌ 실시간 업데이트를 일봉/주봉에 사용

```typescript
// ❌ DON'T: 일봉에 realtime 사용
<CandlestickChart
  timeframe={{ type: 'days' }}
  realtime={true}  // ❌ 분봉만 지원!
/>

// ✅ DO: 분봉에만 realtime 사용
<CandlestickChart
  timeframe={{ type: 'minutes', unit: 1 }}
  realtime={true}  // ✅ OK
/>
```

### ❌ 하드코딩된 마켓 코드

```typescript
// ❌ DON'T: 마켓 코드 하드코딩
const markets = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP'];

// ✅ DO: useKrwMarkets 사용
const { data: krwMarkets } = useKrwMarkets();
const marketCodes = krwMarkets?.map((m) => m.market) ?? [];
```

### ❌ Query Key 중복 정의

```typescript
// ❌ DON'T: 각자 query key 정의
useQuery({
  queryKey: ['candles', market, timeframe], // ❌ 다른 곳과 불일치
  // ...
});

// ✅ DO: UPBIT_QUERY_KEYS 사용
import { UPBIT_QUERY_KEYS } from '@/entities/upbit';

useQuery({
  queryKey: UPBIT_QUERY_KEYS.candles(market, JSON.stringify(timeframe)),
  // ...
});
```

## 📚 참고 문서

- API 명세: `/upbit/*.md`
- 차트 예제: `src/features/upbit-chart/ui/candlestick-chart.stories.tsx`
- 엔티티 코드: `src/entities/upbit/`
- lightweight-charts 문서: https://tradingview.github.io/lightweight-charts/

## 💡 Best Practices

1. **항상 TanStack Query 훅 사용** - 캐싱, 리페칭, 에러 처리 자동화
2. **타임존 명시** - KST 데이터는 `+09:00` 추가
3. **타입 안전성** - `CandleTimeframe`, `Market` 등 타입 활용
4. **상수 관리** - `UPBIT_QUERY_KEYS`, `DEFAULT_MARKET` 등 사용
5. **중복 제거** - `to` parameter 사용 시 `getPreviousCandleTime` 활용
6. **에러 처리** - 사용자 친화적 메시지 + 콘솔 로그
