'use client';

import { create } from 'zustand';
import type { Message } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedMessages, SEED_VERSION } from '@/data/seed';

const MESSAGE_VERSION_KEY = 'messages_version';

export interface Conversation {
  partnerId: string;
  partnerNickname: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

interface MessageState {
  messages: Message[];
  initialized: boolean;
  init: () => void;
  addMessage: (m: Message) => void;
  markRead: (id: string) => void;
  markConversationRead: (userId: string, partnerId: string) => void;
  getForUser: (userId: string) => Message[];
  getConversations: (userId: string, nicknameLookup: Record<string, string>) => Conversation[];
  getUnreadCount: (userId: string) => number;
  getThread: (userId: string, partnerId: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const storedVersion = getItem<number>(MESSAGE_VERSION_KEY);
    const stored = getItem<Message[]>('messages');
    if (stored && stored.length > 0 && storedVersion === SEED_VERSION) {
      set({ messages: stored, initialized: true });
    } else {
      setItem('messages', seedMessages);
      setItem(MESSAGE_VERSION_KEY, SEED_VERSION);
      set({ messages: seedMessages, initialized: true });
    }
  },

  addMessage: (m) => {
    const updated = [...get().messages, m];
    setItem('messages', updated);
    set({ messages: updated });
    // Auto-complete mission dm-4 when sending a team-request
    if (m.type === 'team-request') {
      setTimeout(async () => {
        try {
          const { useMissionStore } = await import('@/store/mission');
          const { useUserStore } = await import('@/store/user');
          const ms = useMissionStore.getState();
          ms.completeMission('dm-4', (pts: number) => useUserStore.getState().addPoints(pts));
        } catch { /* ignore */ }
      }, 0);
    }
  },

  markRead: (id) => {
    const messages = get().messages.map((m) =>
      m.id === id ? { ...m, read: true } : m
    );
    setItem('messages', messages);
    set({ messages });
  },

  markConversationRead: (userId, partnerId) => {
    const messages = get().messages.map((m) =>
      m.to === userId && m.from === partnerId && !m.read ? { ...m, read: true } : m
    );
    setItem('messages', messages);
    set({ messages });
  },

  getForUser: (userId) => get().messages.filter((m) => m.to === userId || m.from === userId),

  getConversations: (userId, nicknameLookup) => {
    const msgs = get().messages.filter((m) => m.from === userId || m.to === userId);
    const map = new Map<string, { msgs: Message[] }>();
    for (const m of msgs) {
      const partner = m.from === userId ? m.to : m.from;
      if (!map.has(partner)) map.set(partner, { msgs: [] });
      map.get(partner)!.msgs.push(m);
    }
    const convs: Conversation[] = [];
    for (const [partnerId, { msgs: thread }] of map) {
      const sorted = [...thread].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const last = sorted[0];
      convs.push({
        partnerId,
        partnerNickname: nicknameLookup[partnerId] || partnerId,
        lastMessage: last.content,
        lastAt: last.createdAt,
        unreadCount: thread.filter((m) => m.to === userId && !m.read).length,
      });
    }
    return convs.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  },

  getUnreadCount: (userId) => {
    return get().messages.filter((m) => m.to === userId && !m.read).length;
  },

  getThread: (userId, partnerId) => {
    return get().messages
      .filter((m) => (m.from === userId && m.to === partnerId) || (m.from === partnerId && m.to === userId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
}));
