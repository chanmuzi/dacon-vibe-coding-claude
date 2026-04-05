'use client';

import { create } from 'zustand';
import type { DailyMission } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedDailyMissions } from '@/data/seed';

interface MissionState {
  missions: DailyMission[];
  initialized: boolean;
  init: () => void;
  toggleMission: (id: string, onComplete?: (points: number) => void) => void;
  completeMission: (id: string, onComplete?: (points: number) => void) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<DailyMission[]>('missions');
    if (stored && stored.length > 0) {
      set({ missions: stored, initialized: true });
    } else {
      setItem('missions', seedDailyMissions);
      set({ missions: seedDailyMissions, initialized: true });
    }
  },

  toggleMission: (id, onComplete?: (points: number) => void) => {
    const target = get().missions.find((m) => m.id === id);
    if (!target) return;
    const wasCompleted = target.completed;
    const missions = get().missions.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setItem('missions', missions);
    set({ missions });
    if (!wasCompleted && onComplete) {
      onComplete(target.points);
    }
  },

  completeMission: (id, onComplete?: (points: number) => void) => {
    const target = get().missions.find((m) => m.id === id);
    if (!target || target.completed) return;
    const missions = get().missions.map((m) =>
      m.id === id ? { ...m, completed: true } : m
    );
    setItem('missions', missions);
    set({ missions });
    if (onComplete) onComplete(target.points);
  },
}));
