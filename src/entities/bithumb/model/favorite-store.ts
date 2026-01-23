'use client';

import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

/**
 * IndexedDB 기반 StateStorage 어댑터 (idb-keyval 사용)
 */
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface FavoriteState {
  favorites: string[];
  toggleFavorite: (market: string) => void;
  setFavorites: (favorites: string[]) => void;
}

const FAVORITES_KEY = 'market-coin-favorites';
const FAVORITES_CHANNEL = 'market-coin-favorites-sync';

// BroadcastChannel은 클라이언트에서만 생성
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined') {
  broadcastChannel = new BroadcastChannel(FAVORITES_CHANNEL);
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (market: string) => {
        const current = get().favorites;
        const exists = current.includes(market);
        const next = exists ? current.filter((m) => m !== market) : [...current, market];

        set({ favorites: next });

        // BroadcastChannel을 통해 다른 탭에 상태 변경 알림
        if (broadcastChannel) {
          broadcastChannel.postMessage(next);
        }
      },

      setFavorites: (favorites: string[]) => {
        set({ favorites });
      },
    }),
    {
      name: FAVORITES_KEY,
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);

// 다른 탭으로부터 BroadcastChannel 이벤트 수신
if (typeof window !== 'undefined' && broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (Array.isArray(event.data)) {
      const current = useFavoriteStore.getState().favorites;
      // 상태가 다를 때만 업데이트 (무한 루프 방지)
      if (JSON.stringify(current) !== JSON.stringify(event.data)) {
        useFavoriteStore.getState().setFavorites(event.data);
      }
    }
  };
}
