'use client';

import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { getItem, setItem, removeItem } from '@/lib/localStorage';
import { defaultUserProfile, getGradeFromPoints } from '@/data/seed';

// 비밀번호 평문 저장 방지 — 클라이언트 전용 해싱 (프로덕션에서는 서버사이드 bcrypt/argon2 필수)
function hashPassword(pw: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const h1 = (h >>> 0).toString(16).padStart(8, '0');
  h = 0xc6a4a793;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = Math.imul(h, 0x5bd1e995);
  }
  return h1 + (h >>> 0).toString(16).padStart(8, '0');
}

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
    // ⚠️ Mock auth only — plaintext password in localStorage (no server, demo purpose only)
    const accounts = getItem<Record<string, UserProfile>>('daclaw_accounts') ?? {};
    const account = Object.values(accounts).find(
      (a) => a.nickname === nickname || a.email === nickname
    );
    if (!account) return { success: false, error: '등록되지 않은 계정입니다.' };
    if (account.password !== hashPassword(password)) return { success: false, error: '비밀번호가 일치하지 않습니다.' };

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
      password: hashPassword(password),
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
    // 계정 저장소도 동기화하여 재로그인 시 롤백 방지
    const accounts = getItem<Record<string, UserProfile>>('daclaw_accounts') ?? {};
    if (accounts[current.id]) {
      accounts[current.id] = { ...accounts[current.id], points: newPoints, grade: grade as UserProfile['grade'] };
      setItem('daclaw_accounts', accounts);
    }
  },

  setApiKey: (key) => {
    const current = get().user;
    if (!current) return;
    // API 키는 메모리에만 보관, localStorage에 persist하지 않음
    set({ user: { ...current, apiKey: key } });
  },
}));
