'use client';

import { create } from 'zustand';
import type { Message } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedMessages } from '@/data/seed';

interface MessageState {
  messages: Message[];
  initialized: boolean;
  init: () => void;
  addMessage: (m: Message) => void;
  markRead: (id: string) => void;
  getForUser: (userId: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<Message[]>('messages');
    if (stored && stored.length > 0) {
      set({ messages: stored, initialized: true });
    } else {
      setItem('messages', seedMessages);
      set({ messages: seedMessages, initialized: true });
    }
  },

  addMessage: (m) => {
    const updated = [...get().messages, m];
    setItem('messages', updated);
    set({ messages: updated });
  },

  markRead: (id) => {
    const messages = get().messages.map((m) =>
      m.id === id ? { ...m, read: true } : m
    );
    setItem('messages', messages);
    set({ messages });
  },

  getForUser: (userId) => get().messages.filter((m) => m.to === userId || m.from === userId),
}));
