'use client';

import { create } from 'zustand';
import type { RankingEntry } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedRankings } from '@/data/seed';

interface RankingState {
  rankings: RankingEntry[];
  initialized: boolean;
  init: () => void;
}

export const useRankingStore = create<RankingState>((set, get) => ({
  rankings: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<RankingEntry[]>('rankings');
    if (stored && stored.length > 0) {
      set({ rankings: stored, initialized: true });
    } else {
      setItem('rankings', seedRankings);
      set({ rankings: seedRankings, initialized: true });
    }
  },
}));
