'use client';

import { create } from 'zustand';
import type { Submission, Leaderboard } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedSubmissions, seedLeaderboards } from '@/data/seed';

interface SubmissionState {
  submissions: Submission[];
  leaderboards: Leaderboard[];
  initialized: boolean;
  init: () => void;
  addSubmission: (s: Submission) => void;
  getByHackathon: (slug: string) => Submission[];
  getLeaderboard: (slug: string) => Leaderboard | undefined;
  updateLeaderboard: (slug: string, teamId: string, teamName: string, score: number) => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  leaderboards: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const subs = getItem<Submission[]>('submissions') ?? seedSubmissions;
    const lbs = getItem<Leaderboard[]>('leaderboards') ?? seedLeaderboards;
    if (!getItem<Submission[]>('submissions')) setItem('submissions', seedSubmissions);
    if (!getItem<Leaderboard[]>('leaderboards')) setItem('leaderboards', seedLeaderboards);
    set({ submissions: subs, leaderboards: lbs, initialized: true });
  },

  addSubmission: (s) => {
    const updated = [...get().submissions, s];
    setItem('submissions', updated);
    set({ submissions: updated });
  },

  getByHackathon: (slug) => get().submissions.filter((s) => s.hackathonSlug === slug),

  getLeaderboard: (slug) => get().leaderboards.find((l) => l.hackathonSlug === slug),

  updateLeaderboard: (slug, teamId, teamName, score) => {
    const lbs = [...get().leaderboards];
    let idx = lbs.findIndex((l) => l.hackathonSlug === slug);
    if (idx === -1) {
      lbs.push({ hackathonSlug: slug, entries: [], status: 'live' });
      idx = lbs.length - 1;
    }
    const lb = { ...lbs[idx] };
    const entries = [...lb.entries];
    const eIdx = entries.findIndex((e) => e.teamId === teamId);
    if (eIdx >= 0) {
      const bestScore = Math.max(entries[eIdx].score, score);
      entries[eIdx] = { ...entries[eIdx], score: bestScore, submissionCount: entries[eIdx].submissionCount + 1, lastSubmittedAt: new Date().toISOString() };
    } else {
      entries.push({ teamId, teamName, score, rank: entries.length + 1, submissionCount: 1, lastSubmittedAt: new Date().toISOString() });
    }
    entries.sort((a, b) => b.score - a.score);
    const rankedEntries = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    lb.entries = rankedEntries;
    lbs[idx] = lb;
    setItem('leaderboards', lbs);
    set({ leaderboards: lbs });
  },
}));
