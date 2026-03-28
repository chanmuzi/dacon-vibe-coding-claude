'use client';

import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { getItem, setItem, removeItem } from '@/lib/localStorage';
import { defaultUserProfile, getGradeFromPoints } from '@/data/seed';

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  initialized: boolean;
  init: () => void;
  login: (nickname: string, email: string) => void;
  logout: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addPoints: (points: number) => void;
  setApiKey: (key: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<UserProfile>('userProfile');
    if (stored && stored.nickname) {
      set({ user: stored, isLoggedIn: true, initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  login: (nickname, email) => {
    const existing = getItem<UserProfile>('userProfile');
    const user: UserProfile = existing && existing.nickname === nickname
      ? existing
      : { ...defaultUserProfile, id: `user-${Date.now()}`, nickname, email, joinedAt: new Date().toISOString().slice(0, 10) };
    setItem('userProfile', user);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    removeItem('userProfile');
    set({ user: null, isLoggedIn: false });
  },

  updateProfile: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    setItem('userProfile', updated);
    set({ user: updated });
  },

  addPoints: (points) => {
    const current = get().user;
    if (!current) return;
    const newPoints = current.points + points;
    const grade = getGradeFromPoints(newPoints);
    const updated = { ...current, points: newPoints, grade: grade as UserProfile['grade'] };
    setItem('userProfile', updated);
    set({ user: updated });
  },

  setApiKey: (key) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, apiKey: key };
    setItem('userProfile', updated);
    set({ user: updated });
  },
}));
