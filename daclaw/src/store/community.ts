'use client';

import { create } from 'zustand';
import type { CommunityPost, Comment } from '@/types';
import { getItem, setItem } from '@/lib/localStorage';
import { seedCommunityPosts } from '@/data/seed';

interface CommunityState {
  posts: CommunityPost[];
  initialized: boolean;
  init: () => void;
  addPost: (p: CommunityPost) => void;
  addComment: (postId: string, comment: Comment) => void;
  toggleLike: (postId: string, userId: string) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = getItem<CommunityPost[]>('community');
    if (stored && stored.length > 0) {
      set({ posts: stored, initialized: true });
    } else {
      setItem('community', seedCommunityPosts);
      set({ posts: seedCommunityPosts, initialized: true });
    }
  },

  addPost: (p) => {
    const updated = [p, ...get().posts];
    setItem('community', updated);
    set({ posts: updated });
  },

  addComment: (postId, comment) => {
    const posts = get().posts.map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    );
    setItem('community', posts);
    set({ posts });
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
}));
