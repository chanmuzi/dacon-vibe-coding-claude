'use client';

import { create } from 'zustand';
import type { Hackathon, Bookmark } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedHackathons } from '@/data/seed';

interface HackathonState {
  hackathons: Hackathon[];
  bookmarks: Bookmark[];
  initialized: boolean;
  init: () => void;
  addHackathon: (h: Hackathon) => void;
  toggleBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
  getBySlug: (slug: string) => Hackathon | undefined;
}

export const useHackathonStore = create<HackathonState>((set, get) => ({
  hackathons: [],
  bookmarks: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<Hackathon[]>('hackathons');
    const bookmarks = getItem<Bookmark[]>('bookmarks') ?? [];
    if (stored && stored.length > 0) {
      set({ hackathons: stored, bookmarks, initialized: true });
    } else {
      setItem('hackathons', seedHackathons);
      setItem('bookmarks', []);
      set({ hackathons: seedHackathons, bookmarks: [], initialized: true });
    }
  },

  addHackathon: (h) => {
    const updated = [...get().hackathons, h];
    setItem('hackathons', updated);
    set({ hackathons: updated });
  },

  toggleBookmark: (slug) => {
    const current = get().bookmarks;
    const exists = current.find((b) => b.hackathonSlug === slug);
    const updated = exists
      ? current.filter((b) => b.hackathonSlug !== slug)
      : [...current, { hackathonSlug: slug, createdAt: new Date().toISOString() }];
    setItem('bookmarks', updated);
    set({ bookmarks: updated });

    // A5: 북마크 추가 시 관련 미션 자동 완료
    if (!exists) {
      try {
        const { useMissionStore } = require('@/store/mission');
        const { useUserStore } = require('@/store/user');
        const missionState = useMissionStore.getState();
        const bookmarkMission = missionState.missions.find(
          (m: { title: string; completed: boolean }) => m.title.includes('북마크') && !m.completed
        );
        if (bookmarkMission) {
          missionState.toggleMission(bookmarkMission.id, (points: number) => {
            useUserStore.getState().addPoints(points);
          });
        }
      } catch {
        // Mission store not yet initialized
      }
    }
  },

  isBookmarked: (slug) => get().bookmarks.some((b) => b.hackathonSlug === slug),

  getBySlug: (slug) => get().hackathons.find((h) => h.slug === slug),
}));
