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

    // Version-based re-seed: when seed data changes, force refresh non-custom hackathons
    const SEED_VERSION = 5;
    const storedVersion = getItem<number>('hackathons-seed-version');
    const stored = getItem<Hackathon[]>('hackathons');
    const bookmarks = getItem<Bookmark[]>('bookmarks') ?? [];

    if (stored && stored.length > 0 && storedVersion === SEED_VERSION) {
      // Migrate: fill missing organizer/color
      const migrated = stored.map((h) => {
        if (h.organizer && h.color) return h;
        const seed = seedHackathons.find((s) => s.slug === h.slug);
        return {
          ...h,
          organizer: h.organizer || seed?.organizer || (h.isCustom ? '개인' : '미지정'),
          color: h.color || seed?.color || '#6B7280',
        };
      });
      setItem('hackathons', migrated);
      set({ hackathons: migrated, bookmarks, initialized: true });
    } else {
      // Re-seed: keep user-created hackathons, replace seed ones
      const customHackathons = (stored ?? []).filter((h) => h.isCustom);
      const merged = [...seedHackathons, ...customHackathons];
      setItem('hackathons', merged);
      setItem('hackathons-seed-version', SEED_VERSION);
      set({ hackathons: merged, bookmarks, initialized: true });
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

    // A5: 북마크 추가 시 관련 미션 자동 완료 (dm-1 = "해커톤 1개 북마크하기")
    if (!exists) {
      setTimeout(async () => {
        try {
          const { useMissionStore } = await import('@/store/mission');
          const { useUserStore } = await import('@/store/user');
          const ms = useMissionStore.getState();
          const target = ms.missions.find((m: { id: string; completed: boolean }) => m.id === 'dm-1' && !m.completed);
          if (target) {
            ms.toggleMission(target.id, (pts: number) => useUserStore.getState().addPoints(pts));
          }
        } catch { /* store not ready */ }
      }, 0);
    }
  },

  isBookmarked: (slug) => get().bookmarks.some((b) => b.hackathonSlug === slug),

  getBySlug: (slug) => get().hackathons.find((h) => h.slug === slug),
}));
