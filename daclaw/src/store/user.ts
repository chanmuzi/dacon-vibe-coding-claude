'use client';

import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { getItem, setItem, removeItem } from '@/lib/localStorage';
import { defaultUserProfile, getGradeFromPoints } from '@/data/seed';

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  initialized: boolean;
  showAuthModal: boolean;
  init: () => void;
  login: (nickname: string, password: string) => { success: boolean; error?: string };
  register: (nickname: string, email: string, password: string, role: import('@/types').Role) => { success: boolean; error?: string };
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addPoints: (points: number) => void;
  setApiKey: (key: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  initialized: false,
  showAuthModal: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<UserProfile>('userProfile');
    if (stored && stored.nickname) {
      set({ user: stored, isLoggedIn: true, initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  login: (nickname, password) => {
    // Check registered accounts in localStorage
    const accounts = getItem<Record<string, UserProfile>>('daclaw_accounts') ?? {};
    const account = Object.values(accounts).find(
      (a) => a.nickname === nickname || a.email === nickname
    );
    if (!account) return { success: false, error: '등록되지 않은 계정입니다.' };
    if (account.password !== password) return { success: false, error: '비밀번호가 일치하지 않습니다.' };

    const user = { ...account };
    delete user.password; // Don't keep password in active session
    setItem('userProfile', user);
    set({ user, isLoggedIn: true, showAuthModal: false });
    return { success: true };
  },

  register: (nickname, email, password, role) => {
    const accounts = getItem<Record<string, UserProfile>>('daclaw_accounts') ?? {};

    // Check duplicates
    if (Object.values(accounts).some((a) => a.nickname === nickname)) {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }
    if (Object.values(accounts).some((a) => a.email === email)) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    const id = `user-${Date.now()}`;
    const newUser: UserProfile = {
      ...defaultUserProfile,
      id,
      nickname,
      email,
      password,
      role,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    accounts[id] = newUser;
    setItem('daclaw_accounts', accounts);

    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setItem('userProfile', sessionUser);
    set({ user: sessionUser, isLoggedIn: true, showAuthModal: false });
    return { success: true };
  },

  logout: () => {
    removeItem('userProfile');
    set({ user: null, isLoggedIn: false });
  },

  openAuthModal: () => set({ showAuthModal: true }),
  closeAuthModal: () => set({ showAuthModal: false }),

  updateProfile: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    setItem('userProfile', updated);
    set({ user: updated });
    // Also update in accounts
    const accounts = getItem<Record<string, UserProfile>>('daclaw_accounts') ?? {};
    if (accounts[current.id]) {
      accounts[current.id] = { ...accounts[current.id], ...partial };
      setItem('daclaw_accounts', accounts);
    }
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
