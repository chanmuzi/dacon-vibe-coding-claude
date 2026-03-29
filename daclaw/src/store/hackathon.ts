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
  },

  isBookmarked: (slug) => get().bookmarks.some((b) => b.hackathonSlug === slug),

  getBySlug: (slug) => get().hackathons.find((h) => h.slug === slug),
}));
