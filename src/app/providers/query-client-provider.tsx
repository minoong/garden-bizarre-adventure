'use client';
import { QueryClientProvider as Provider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type * as React from 'react';

import { getQueryClient } from '@/shared/lib/query-client';

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <Provider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </Provider>
  );
}
