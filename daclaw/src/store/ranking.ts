'use client';

import { create } from 'zustand';
import type { RankingEntry } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedRankings } from '@/data/seed';

const RANKING_SEED_VERSION = 2;

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
    const storedVersion = getItem<number>('rankings_version');
    const stored = getItem<RankingEntry[]>('rankings');
    if (stored && stored.length > 0 && storedVersion === RANKING_SEED_VERSION) {
      set({ rankings: stored, initialized: true });
    } else {
      setItem('rankings', seedRankings);
      setItem('rankings_version', RANKING_SEED_VERSION);
      set({ rankings: seedRankings, initialized: true });
    }
  },
}));
