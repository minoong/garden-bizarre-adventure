# 암호화폐 거래소 API 사용 가이드

이 스킬은 **암호화폐 거래소 API** 엔티티 및 차트 컴포넌트 사용 방법을 정의합니다.

**참고**: 빗썸 API 사용 (빗썸 호환)

- 빗썸 API의 rate limit (HTTP 429) 회피를 위해 빗썸 API 사용
- 빗썸은 빗썸와 동일한 REST/WebSocket API 스펙 제공
- 코드베이스에서는 `bithumb` 이름을 유지하지만 실제로는 빗썸 엔드포인트 사용

## 📁 디렉토리 구조

```
src/
├── entities/bithumb/              # Bithumb API 엔티티
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
│   │   └── use-bithumb-socket.ts  # WebSocket 훅
│   └── lib/
│       ├── format.ts            # parseMarketCode, getMarketLabel 등
│       └── websocket-manager.ts # WebSocket 매니저
│
└── features/bithumb-chart/        # 차트 기능
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

- **REST Base URL**: `https://api.bithumb.com` (빗썸, 빗썸 호환)
- **WebSocket URL**: `wss://ws-api.bithumb.com/websocket/v1` (빗썸 공개형)
- **인증**: Public API는 인증 불필요
- **응답 형식**: JSON
- **시간 형식**: ISO 8601 (`yyyy-MM-ddTHH:mm:ss`)
- **Rate Limit**: WebSocket 연결 요청은 IP 기준 초당 10회

### 지원 API

| API       | 엔드포인트                              | 설명                                     |
| --------- | --------------------------------------- | ---------------------------------------- |
| 마켓 목록 | `GET /v1/market/all`                    | 전체 마켓 조회                           |
| 현재가    | `GET /v1/ticker`                        | 실시간 시세 조회                         |
| 분봉 캔들 | `GET /v1/candles/minutes/{unit}`        | 1, 3, 5, ..., 240분                      |
| 일봉 캔들 | `GET /v1/candles/days`                  | 일봉                                     |
| 주봉 캔들 | `GET /v1/candles/weeks`                 | 주봉                                     |
| 월봉 캔들 | `GET /v1/candles/months`                | 월봉                                     |
| WebSocket | `wss://ws-api.bithumb.com/websocket/v1` | 실시간 데이터 (ticker, trade, orderbook) |

## 📊 캔들 데이터 API

### 분봉 조회

```typescript
import { fetchMinuteCandles } from '@/entities/bithumb';

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
import { fetchCandles } from '@/entities/bithumb';
import type { CandleTimeframe } from '@/entities/bithumb';

// 분봉
const timeframe: CandleTimeframe = { type: 'minutes', unit: 15 };
const candles = await fetchCandles('KRW-BTC', timeframe, { count: 100 });

// 일봉
const timeframe2: CandleTimeframe = { type: 'days' };
const candles2 = await fetchCandles('KRW-BTC', timeframe2, { count: 30 });
```

### TanStack Query 훅 사용

```typescript
import { useCandles } from '@/entities/bithumb';

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
import { useMarkets } from '@/entities/bithumb';

const { data: markets } = useMarkets();
// Market[] 타입: { market: 'KRW-BTC', korean_name: '비트코인', english_name: 'Bitcoin' }
```

### KRW 마켓만 조회

```typescript
import { useKrwMarkets } from '@/entities/bithumb';

const { data: krwMarkets, isLoading } = useKrwMarkets();
// KRW로 시작하는 마켓만 필터링
```

### 마켓 라벨 생성

```typescript
import { getMarketLabel } from '@/entities/bithumb';
import type { Market } from '@/entities/bithumb';

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
import { CandlestickChart } from '@/features/bithumb-chart/ui';

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

### 실시간 업데이트 (ticker WebSocket)

**⚠️ 중요**: 빗썸 WebSocket은 **캔들 데이터를 제공하지 않습니다!**

빗썸 WebSocket 지원 타입:

- ✅ `ticker` (현재가)
- ✅ `trade` (체결)
- ✅ `orderbook` (호가)
- ❌ `candle` (캔들) - **미지원**

**해결 방법**: ticker WebSocket으로 실시간 업데이트 구현

```typescript
<CandlestickChart
  market="KRW-BTC"
  timeframe={{ type: 'minutes', unit: 5 }}
  realtime={true}  // ✅ ticker 데이터로 실시간 가격 업데이트
  options={{ height: 500 }}
/>
```

**동작 방식**:

1. REST API로 초기 캔들 데이터 로드
2. ticker WebSocket 구독하여 실시간 가격 수신
3. ticker 가격으로 최신 캔들의 OHLC 업데이트
4. 타임프레임 시간이 지나면 자동으로 새 캔들 생성

**주의**: 완벽한 캔들 데이터는 아니며 ticker 가격 기반 근사값입니다.

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

**해결**: KST 타임존 명시 (`+09:00` 추가)

```typescript
// src/features/bithumb-chart/lib/transform.ts

// ✅ DO: KST 타임존 명시
function parseKstToTimestamp(kstDateString: string): number {
  return Math.floor(new Date(kstDateString + '+09:00').getTime() / 1000);
}
```

### `to` parameter 사용법 (무한 스크롤)

**중요**: API의 `to` parameter는 **exclusive**입니다!

```typescript
// ✅ DO: oldest 시간을 그대로 전달 (exclusive이므로 중복 없음)
const oldestCandleTime = allCandles[allCandles.length - 1].candle_date_time_kst;

const moreCandles = await fetchCandles(market, timeframe, {
  to: oldestCandleTime, // ✅ exclusive: oldest 미만의 데이터만 반환 (중복 없음)
  count: 100,
});
```

**설명**:

- `to` parameter는 **exclusive** (미만)
- oldest가 `2024-01-01 14:00:00`이면 → API는 `14:00:00` **미만** 데이터 반환
- `13:55:00`, `13:50:00`... 등 이전 캔들만 반환 (14:00:00 제외)
- 따라서 **그대로 전달하면 중복 없이 과거 데이터 로드**

## 🔌 WebSocket 실시간 데이터

### useBithumbSocket 훅

```typescript
import { useBithumbSocket } from '@/entities/bithumb';

function RealtimeTicker() {
  const { candles, status } = useBithumbSocket(
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

### WebSocket 요청 형식 (Bithumb)

빗썸 WebSocket은 빗썸와 동일한 요청 형식을 사용합니다:

```json
[{ "ticket": "unique-ticket-id" }, { "type": "ticker", "codes": ["KRW-BTC"] }, { "format": "DEFAULT" }]
```

**지원 타입**:

- `ticker`: 현재가 (실시간 시세)
- `trade`: 체결 (실시간 거래 내역)
- `orderbook`: 호가 (실시간 호가창)
- `candle.Xm`: 분봉 캔들 (X = 1, 3, 5, 10, 15, 30, 60, 240)

**응답 구조**:

- 각 메시지에는 `type` 필드 포함
- `stream_type`: `SNAPSHOT` (최초 데이터) 또는 `REALTIME` (실시간 업데이트)

## 🚫 Anti-patterns (금지 사항)

### ❌ 타임존 누락

```typescript
// ❌ DON'T: 타임존 정보 없이 변환
const timestamp = new Date(candle.candle_date_time_kst).getTime();
// 로컬 타임존으로 해석되어 잘못된 시간!

// ✅ DO: KST 타임존 명시
const timestamp = new Date(candle.candle_date_time_kst + '+09:00').getTime();
```

### ❌ to parameter 잘못 사용

```typescript
// ❌ DON'T: API가 exclusive인데 1 단위 빼기 (데이터 누락!)
const oldestTime = candles[candles.length - 1].candle_date_time_kst;
const toParam = getPreviousCandleTime(oldestTime, timeframe); // ❌ 1개 누락!
const more = await fetchCandles(market, timeframe, {
  to: toParam,
});

// ✅ DO: exclusive이므로 그대로 전달
const oldestTime = candles[candles.length - 1].candle_date_time_kst;
const more = await fetchCandles(market, timeframe, {
  to: oldestTime, // ✅ exclusive: oldest 미만만 반환되므로 중복 없음
});
```

### ✅ 실시간 업데이트 (ticker WebSocket)

빗썸은 WebSocket 캔들을 지원하지 않지만, **ticker WebSocket으로 대체 구현**되어 있습니다:

```typescript
// ✅ realtime={true}: ticker WebSocket으로 실시간 가격 업데이트
<CandlestickChart
  market="KRW-BTC"
  timeframe={{ type: 'minutes', unit: 1 }}
  realtime={true}  // ✅ ticker 데이터로 최신 캔들 업데이트
/>
```

**동작 방식**:

1. REST API로 초기 캔들 데이터 로드
2. ticker WebSocket 구독
3. ticker 가격으로 최신 캔들의 OHLC 업데이트
4. 시간이 지나면 자동으로 새 캔들 생성

**주의**: 완벽한 캔들 데이터는 아니며 ticker 가격 기반 근사값입니다.

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

// ✅ DO: BITHUMB_QUERY_KEYS 사용
import { BITHUMB_QUERY_KEYS } from '@/entities/bithumb';

useQuery({
  queryKey: BITHUMB_QUERY_KEYS.candles(market, JSON.stringify(timeframe)),
  // ...
});
```

## 📚 참고 문서

- API 명세: `/bithumb/*.md`
- 차트 예제: `src/features/bithumb-chart/ui/candlestick-chart.stories.tsx`
- 엔티티 코드: `src/entities/bithumb/`
- lightweight-charts 문서: https://tradingview.github.io/lightweight-charts/

## 💡 Best Practices

1. **항상 TanStack Query 훅 사용** - 캐싱, 리페칭, 에러 처리 자동화
2. **타임존 명시** - KST 데이터는 `+09:00` 추가
3. **타입 안전성** - `CandleTimeframe`, `Market` 등 타입 활용
4. **상수 관리** - `BITHUMB_QUERY_KEYS`, `DEFAULT_MARKET` 등 사용
5. **중복 제거** - `to` parameter 사용 시 `getPreviousCandleTime` 활용
6. **에러 처리** - 사용자 친화적 메시지 + 콘솔 로그
