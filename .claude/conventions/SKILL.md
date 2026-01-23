# Coding Conventions

이 스킬은 **Garden Bizarre Adventure** 프로젝트의 코딩 컨벤션을 정의합니다.
Claude Code는 코드를 작성하기 전에 **반드시** 이 문서를 참조해야 합니다.

## Import 순서 (ESLint 강제)

```typescript
// 1. Built-in modules (React, Next.js)
import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// 2. External modules (알파벳 순, MUI/TanStack 등)
import { Button, Grid, Card } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

// 3. Internal modules (@/ alias)
import type { Post, User } from '@/entities/post';
import { Dropzone } from '@/shared/ui/dropzone';
import { supabase } from '@/shared/lib/supabase/client';

// 4. Relative imports
import { useAuth } from './hooks';
import type { ComponentProps } from './types';
```

**중요**: Import 순서가 틀리면 ESLint 에러 발생!

## TypeScript 규칙

### Type Imports 필수

```typescript
// ✅ DO: type import 사용
import type { FC, ReactNode } from 'react';
import type { Post, User } from '@/entities';

// ❌ DON'T: 일반 import (ESLint 에러)
import { FC, ReactNode } from 'react';
import { Post, User } from '@/entities';
```

### 컴포넌트 Props 타입 정의

```typescript
// ✅ DO: Type alias 선호 (interface보다)
type PostCardProps = {
  post: Post;
  onLike?: (id: string) => void;
  children?: ReactNode;
};

export const PostCard: FC<PostCardProps> = ({ post, onLike, children }) => {
  // ...
};

// ❌ DON'T: Interface 사용 지양
interface PostCardProps {
  // ❌ type을 사용하세요
  post: Post;
}
```

### Unused Variables

```typescript
// ✅ DO: _ prefix for unused variables
const handleClick = (_event: MouseEvent) => {
  console.log('clicked');
};

// ❌ DON'T: 사용하지 않는 변수 그대로
const handleClick = (event: MouseEvent) => {
  // ❌ 'event' is unused
  console.log('clicked');
};
```

## MUI v7 컴포넌트 규칙

### ⚠️ 중요: Grid2는 존재하지 않습니다!

MUI v7에는 `Grid2` 컴포넌트가 **없습니다**. 반드시 `Grid`를 사용하세요.

```typescript
// ✅ DO: Grid 컴포넌트 (item, xs, sm props 사용)
import { Grid, Card } from '@mui/material';

<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content 1</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content 2</Card>
  </Grid>
</Grid>

// ❌ DON'T: Grid2 사용 (존재하지 않음!)
import { Grid2 } from '@mui/material';  // ❌ Error: Grid2 does not exist

<Grid2 container>  // ❌ 컴파일 에러 발생
  <Grid2>Content</Grid2>
</Grid2>
```

### 반응형 레이아웃

```typescript
// ✅ DO: xs, sm, md, lg, xl breakpoints 사용
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card />
  </Grid>
</Grid>

// ✅ DO: Stack 컴포넌트도 활용 가능
import { Stack } from '@mui/material';

<Stack direction="row" spacing={2} flexWrap="wrap">
  <Card />
  <Card />
</Stack>
```

## Feature-Sliced Design (FSD) 아키텍처

### 디렉토리 구조 규칙

```
src/
├── app/              # Next.js App Router 페이지
│   └── providers/    # React context providers
├── widgets/          # 큰 UI 조합 (header, footer, hero)
├── features/         # 비즈니스 로직 기능
│   └── [feature]/
│       ├── ui/       # 기능별 UI 컴포넌트
│       ├── model/    # 상태 관리 (zustand, hooks)
│       └── lib/      # 기능별 유틸리티
├── entities/         # 비즈니스 엔티티 (bithumb, post, user 등)
│   └── [entity]/
│       ├── api/      # API 클라이언트
│       ├── model/    # 타입, 상수
│       ├── hooks/    # React Query 훅
│       └── lib/      # 변환/포맷 유틸리티
├── shared/           # 공유 코드
│   ├── ui/           # 재사용 가능한 UI 컴포넌트
│   ├── lib/          # 공유 라이브러리 (supabase, firebase)
│   ├── api/          # API 유틸리티
│   └── config/       # 설정 파일
└── pages/            # 페이지 조합 (FSD layer)
```

### 새 기능 추가 시

```bash
# ✅ DO: features/[feature-name] 구조 생성
src/features/trading-chart/
├── ui/
│   ├── index.ts                    # Public API
│   ├── candlestick-chart.tsx       # 메인 컴포넌트
│   └── candlestick-chart.stories.tsx  # Storybook
├── model/
│   ├── index.ts
│   └── types.ts                    # 타입 정의
└── lib/
    ├── index.ts
    └── transform.ts                # 데이터 변환 로직

# ❌ DON'T: 평평한 구조
src/components/trading-chart.tsx  // ❌ FSD 구조 무시
```

### 공유 유틸리티 배치 규칙

```typescript
// ✅ DO: 여러 feature에서 사용 → shared/lib
src/shared/lib/image/
├── index.ts
├── heic-converter.ts
└── exif-utils.ts

// ✅ DO: 엔티티 관련 → entities/[entity]/lib
src/entities/bithumb/lib/
└── format.ts          // parseMarketCode, formatPrice 등

// ❌ DON'T: features 내부에 공유 유틸리티
src/features/upload/lib/image-utils.ts  // ❌ 다른 feature 재사용 불가
```

### Index 기반 Exports (Public API)

각 모듈은 `index.ts`에서 public API만 export해야 합니다.

```typescript
// ✅ DO: features/trading-chart/ui/index.ts
export { CandlestickChart } from './candlestick-chart';
export type { CandlestickChartProps } from './candlestick-chart';

// ✅ DO: 외부에서 사용
import { CandlestickChart } from '@/features/trading-chart/ui';

// ❌ DON'T: 내부 파일 직접 import
import { CandlestickChart } from '@/features/trading-chart/ui/candlestick-chart';
```

## Firebase Storage 사용 패턴

### 폴더명 주의: `firbase` (오타 아님!)

**중요**: Firebase 폴더명은 의도적으로 `firbase`입니다. 수정하지 마세요!

```typescript
// ✅ DO: firbase 폴더명 사용
import { uploadFiles } from '@/shared/lib/firbase';
import { storage } from '@/shared/lib/firbase/client';

// ❌ DON'T: firebase로 변경 금지
import { uploadFiles } from '@/shared/lib/firebase'; // ❌ 폴더가 없음
```

### 파일 업로드 패턴

```typescript
import { uploadFiles } from '@/shared/lib/firbase';

const handleUpload = async (files: File[]) => {
  const results = await uploadFiles(files, {
    path: 'images/',
    onProgress: (progress) => {
      console.log(`${progress.completed}/${progress.total} 완료`);
      setProgress(progress);
    },
    fileNameGenerator: (file) => `${Date.now()}-${file.name}`,
  });

  // ✅ DO: 실패한 업로드 처리
  const failed = results.filter((r) => r.status === 'error');
  if (failed.length > 0) {
    toast.error(`${failed.length}개 파일 업로드 실패`);
  }

  const urls = results.filter((r) => r.status === 'success').map((r) => r.url);

  return urls;
};
```

## Supabase 패턴

### RLS (Row Level Security) 신뢰

Supabase는 RLS 정책으로 권한을 관리합니다. 불필요한 수동 체크를 하지 마세요.

```typescript
// ✅ DO: RLS 정책을 신뢰
const { data, error } = await supabase.from('posts').select('*').eq('user_id', userId); // RLS가 자동으로 권한 체크

if (error) {
  console.error('Failed to fetch posts:', error);
}

// ❌ DON'T: 불필요한 수동 권한 체크
const session = await supabase.auth.getSession();
if (session?.user?.id !== userId) {
  // ❌ RLS가 이미 처리
  throw new Error('Unauthorized');
}
const { data } = await supabase.from('posts').select('*');
```

### Client 사용

```typescript
// ✅ DO: 클라이언트 import
import { supabase } from '@/shared/lib/supabase/client';

// 쿼리 예제
const { data: posts, error } = await supabase.from('posts').select('*, author:profiles(*)').order('created_at', { ascending: false }).limit(20);
```

## TanStack Query 사용 패턴

### 커스텀 훅 작성

```typescript
// ✅ DO: entities/[entity]/hooks/ 에 배치
// src/entities/bithumb/hooks/use-candles.ts

import { useQuery } from '@tanstack/react-query';
import { fetchCandles } from '../api/candles';
import { BITHUMB_QUERY_KEYS, BITHUMB_STALE_TIME } from '../model/constants';

export function useCandles(market: string, timeframe: CandleTimeframe, options) {
  return useQuery({
    queryKey: BITHUMB_QUERY_KEYS.candles(market, JSON.stringify(timeframe)),
    queryFn: () => fetchCandles(market, timeframe, options),
    staleTime: BITHUMB_STALE_TIME.CANDLES,
    enabled: !!market,
  });
}
```

### Query Keys 관리

```typescript
// ✅ DO: 상수로 관리 (entities/[entity]/model/constants.ts)
export const BITHUMB_QUERY_KEYS = {
  markets: ['bithumb', 'markets'] as const,
  ticker: (markets: string[]) => ['bithumb', 'ticker', markets] as const,
  candles: (market: string, timeframe: string) => ['bithumb', 'candles', timeframe, market] as const,
} as const;

// ❌ DON'T: 하드코딩된 query keys
useQuery({
  queryKey: ['candles', market], // ❌ 타입 안정성 없음, 재사용 불가
  // ...
});
```

## 에러 처리 패턴

```typescript
// ✅ DO: Specific error types & 사용자 친화적 메시지
try {
  const result = await uploadFile(file);
} catch (error) {
  if (error instanceof StorageError) {
    toast.error('업로드 실패: 파일 용량을 확인해주세요');
  } else if (error instanceof NetworkError) {
    toast.error('네트워크 오류가 발생했습니다');
  } else {
    toast.error('알 수 없는 오류가 발생했습니다');
    console.error('Upload error:', error);
  }
}

// ❌ DON'T: Generic error handling
try {
  await uploadFile(file);
} catch {
  alert('Error'); // ❌ 사용자에게 도움이 안 됨, 디버깅 불가
}
```

## Anti-patterns (절대 금지)

### 🚫 MUI Grid2 사용

- **이유**: MUI v7에 Grid2가 존재하지 않음
- **해결**: `Grid` 컴포넌트 사용

### 🚫 Type Import 누락

- **이유**: ESLint 에러 발생, 번들 사이즈 증가
- **해결**: `import type { ... }` 사용

### 🚫 FSD 구조 무시

- **이유**: features와 shared 경계 모호, 재사용성 저하
- **해결**: 올바른 레이어에 코드 배치

### 🚫 Firebase 폴더명 수정

- **이유**: `firbase`가 프로젝트 컨벤션 (의도적 오타)
- **해결**: 절대 변경하지 말 것

### 🚫 RLS 우회 시도

- **이유**: Supabase 보안 정책 무력화
- **해결**: RLS 정책을 신뢰하고 활용

### 🚫 하드코딩된 Query Keys

- **이유**: 타입 안정성 없음, invalidation 어려움
- **해결**: 상수로 관리 (`BITHUMB_QUERY_KEYS` 등)

### 🚫 Inline Styles 남용

- **이유**: Tailwind CSS v4 사용 중
- **해결**: Tailwind 유틸리티 클래스 사용, 필요시 MUI sx prop

## Storybook 사용

### 컴포넌트마다 Stories 작성

```typescript
// ✅ DO: [ComponentName].stories.tsx 파일 생성
// src/features/trading-chart/ui/candlestick-chart.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CandlestickChart } from './candlestick-chart';

const meta: Meta<typeof CandlestickChart> = {
  title: 'Features/TradingChart/CandlestickChart',
  component: CandlestickChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CandlestickChart>;

export const Default: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 15 },
  },
};
```

## 참고 예제

- **파일 업로드**: `src/app/upload/playground/page.tsx`
- **FSD 구조**: `src/features/auth`, `src/shared/ui/dropzone`
- **MUI Grid**: `src/app/page.tsx`
- **Bithumb 차트**: `src/features/trading-chart/ui/candlestick-chart.tsx`
- **TanStack Query**: `src/entities/bithumb/hooks/use-candles.ts`
