'use client';

import { create } from 'zustand';
import type { CommunityPost, Comment } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedCommunityPosts, SEED_VERSION } from '@/data/seed';

const COMMUNITY_VERSION_KEY = 'community_version';

interface CommunityState {
  posts: CommunityPost[];
  initialized: boolean;
  init: () => void;
  addPost: (p: CommunityPost) => void;
  addComment: (postId: string, comment: Comment) => void;
  toggleLike: (postId: string, userId: string) => void;
  updatePost: (id: string, updates: Partial<CommunityPost>, userId: string) => void;
  deletePost: (id: string, userId: string) => void;
  updateComment: (postId: string, commentId: string, content: string, userId: string) => void;
  deleteComment: (postId: string, commentId: string, userId: string) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const storedVersion = getItem<number>(COMMUNITY_VERSION_KEY);
    const stored = getItem<CommunityPost[]>('community');
    if (stored && stored.length > 0 && storedVersion === SEED_VERSION) {
      set({ posts: stored, initialized: true });
    } else {
      setItem('community', seedCommunityPosts);
      setItem(COMMUNITY_VERSION_KEY, SEED_VERSION);
      set({ posts: seedCommunityPosts, initialized: true });
    }
  },

  addPost: (p) => {
    const updated = [p, ...get().posts];
    setItem('community', updated);
    set({ posts: updated });
    // Auto-complete mission dm-5: 게시글 1개 작성
    setTimeout(async () => {
      try {
        const { useMissionStore } = await import('@/store/mission');
        const { useUserStore } = await import('@/store/user');
        const ms = useMissionStore.getState();
        ms.completeMission('dm-5', (pts: number) => useUserStore.getState().addPoints(pts));
      } catch { /* ignore */ }
    }, 0);
  },

  addComment: (postId, comment) => {
    const posts = get().posts.map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    );
    setItem('community', posts);
    set({ posts });
    // Auto-complete mission dm-2: 커뮤니티 댓글 1개 작성
    setTimeout(async () => {
      try {
        const { useMissionStore } = await import('@/store/mission');
        const { useUserStore } = await import('@/store/user');
        const ms = useMissionStore.getState();
        ms.completeMission('dm-2', (pts: number) => useUserStore.getState().addPoints(pts));
      } catch { /* ignore */ }
    }, 0);
  },

  toggleLike: (postId, userId) => {
    const posts = get().posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likedBy.includes(userId);
      return {
        ...p,
        likes: liked ? p.likes - 1 : p.likes + 1,
        likedBy: liked ? p.likedBy.filter((id) => id !== userId) : [...p.likedBy, userId],
      };
    });
    setItem('community', posts);
    set({ posts });
  },

  updatePost: (id, updates, userId) => {
    const target = get().posts.find((p) => p.id === id);
    if (!target || target.authorId !== userId) return;
    const posts = get().posts.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setItem('community', posts);
    set({ posts });
  },

  deletePost: (id, userId) => {
    const target = get().posts.find((p) => p.id === id);
    if (!target || target.authorId !== userId) return;
    const posts = get().posts.filter((p) => p.id !== id);
    setItem('community', posts);
    set({ posts });
  },

  updateComment: (postId, commentId, content, userId) => {
    const posts = get().posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map((c) =>
          c.id === commentId && c.authorId === userId ? { ...c, content } : c
        ),
      };
    });
    setItem('community', posts);
    set({ posts });
  },

  deleteComment: (postId, commentId, userId) => {
    const posts = get().posts.map((p) => {
      if (p.id !== postId) return p;
      const target = p.comments.find((c) => c.id === commentId);
      if (!target || target.authorId !== userId) return p;
      return { ...p, comments: p.comments.filter((c) => c.id !== commentId) };
    });
    setItem('community', posts);
    set({ posts });
  },
}));
