'use client';

import { create } from 'zustand';
import type { Team } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedTeams } from '@/data/seed';

interface TeamState {
  teams: Team[];
  initialized: boolean;
  init: () => void;
  addTeam: (t: Team) => void;
  getByHackathon: (slug: string) => Team[];
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<Team[]>('teams');
    if (stored && stored.length > 0) {
      set({ teams: stored, initialized: true });
    } else {
      setItem('teams', seedTeams);
      set({ teams: seedTeams, initialized: true });
    }
  },

  addTeam: (t) => {
    const updated = [...get().teams, t];
    setItem('teams', updated);
    set({ teams: updated });
  },

  getByHackathon: (slug) => get().teams.filter((t) => t.hackathonSlugs.includes(slug)),
}));
