'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCommunityStore } from '@/store/community';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import {
  MessageSquare, Heart, Plus, X, ChevronDown, HelpCircle, Lightbulb, Users, MessageCircle, Search,
} from 'lucide-react';
import type { CommunityPost } from '@/types';

const POST_TYPES = [
  { value: 'all', label: '전체', icon: MessageSquare },
  { value: 'question', label: '질문', icon: HelpCircle },
  { value: 'tip', label: '팁', icon: Lightbulb },
  { value: 'team-find', label: '팀 구하기', icon: Users },
  { value: 'free', label: '자유', icon: MessageCircle },
] as const;

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  question: { label: '질문', cls: 'bg-info-light text-info' },
  tip: { label: '팁', cls: 'bg-success-light text-success' },
  'team-find': { label: '팀 구하기', cls: 'bg-type-qualitative-light text-type-qualitative' },
  free: { label: '자유', cls: 'bg-background text-text-secondary' },
};

type SortKey = 'latest' | 'popular' | 'comments';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글순' },
];

export default function CommunityPage() {
  const { posts, addPost, toggleLike } = useCommunityStore();
  const { hackathons } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal } = useUserStore();

  const [typeFilter, setTypeFilter] = useState('all');
  const [hackFilter, setHackFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [showWrite, setShowWrite] = useState(false);
  const [writeForm, setWriteForm] = useState({ title: '', content: '', type: 'free' as CommunityPost['type'], hackathonTag: '' });

  const filtered = useMemo(() => {
    let result = posts;
    if (typeFilter !== 'all') result = result.filter((p) => p.type === typeFilter);
    if (hackFilter !== 'all') result = result.filter((p) => p.hackathonTag === hackFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    if (sortKey === 'latest') result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortKey === 'popular') result = [...result].sort((a, b) => b.likes - a.likes);
    if (sortKey === 'comments') result = [...result].sort((a, b) => b.comments.length - a.comments.length);
    return result;
  }, [posts, typeFilter, hackFilter, searchQuery, sortKey]);

  function handleWritePost(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      openAuthModal();
      return;
    }
    if (!writeForm.title.trim() || !writeForm.content.trim()) return;
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      type: writeForm.type,
      title: writeForm.title,
      content: writeForm.content,
      summary: writeForm.content.slice(0, 100),
      authorId: user.id,
      authorNickname: user.nickname,
      hackathonTag: writeForm.hackathonTag || undefined,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addPost(post);
    setWriteForm({ title: '', content: '', type: 'free', hackathonTag: '' });
    setShowWrite(false);
  }

  function handleLike(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      openAuthModal();
      return;
    }
    toggleLike(postId, user.id);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">커뮤니티</h1>
          <p className="text-text-secondary text-sm mt-1">{filtered.length}개의 게시글</p>
        </div>
        <button
          data-testid="write-post-button"
          onClick={() => {
            if (!isLoggedIn || !user) { openAuthModal(); return; }
            setShowWrite(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> 글쓰기
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            className="pl-8 pr-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-light focus:border-primary w-48"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex gap-1">
          {POST_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === t.value ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Hackathon filter */}
        <div className="relative">
          <select
            value={hackFilter}
            onChange={(e) => setHackFilter(e.target.value)}
            className="pl-3 pr-8 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-light appearance-none"
          >
            <option value="all">모든 해커톤</option>
            {hackathons.map((h) => (
              <option key={h.slug} value={h.slug}>{h.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        {/* Sort dropdown */}
        <div className="relative ml-auto">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="pl-3 pr-8 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-light appearance-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
            게시글이 없습니다. 첫 글을 작성해보세요!
          </div>
        ) : filtered.map((post) => {
          const badge = TYPE_BADGE[post.type];
          const hackathon = hackathons.find((h) => h.slug === post.hackathonTag);
          const liked = user ? post.likedBy.includes(user.id) : false;
          const summary = post.summary ?? post.content.slice(0, 100);

          return (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="flex items-start gap-4 bg-surface border border-border rounded-xl p-5 hover:border-primary-light transition-colors"
            >
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                  {hackathon && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: hackathon.color + '20', color: hackathon.color }}
                    >
                      {hackathon.title}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary mb-1 leading-snug">{post.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-2">{summary}</p>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span>{post.authorNickname}</span>
                  <span>{post.createdAt}</span>
                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Heart
                      size={14}
                      className={liked ? 'fill-current text-primary' : ''}
                    />
                    {post.likes}
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {post.comments.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail */}
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Write Modal */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">게시글 작성</h2>
              <button onClick={() => setShowWrite(false)} className="p-1 rounded-lg hover:bg-background"><X size={20} /></button>
            </div>
            <form onSubmit={handleWritePost} className="space-y-4">
              <div className="flex gap-2">
                {(['question', 'tip', 'team-find', 'free'] as const).map((t) => {
                  const b = TYPE_BADGE[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWriteForm({ ...writeForm, type: t })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        writeForm.type === t ? 'bg-primary text-white' : `${b.cls}`
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
              <select
                value={writeForm.hackathonTag}
                onChange={(e) => setWriteForm({ ...writeForm, hackathonTag: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light"
              >
                <option value="">해커톤 태그 (선택)</option>
                {hackathons.map((h) => (
                  <option key={h.slug} value={h.slug}>{h.title}</option>
                ))}
              </select>
              <input
                data-testid="post-title-input"
                type="text"
                value={writeForm.title}
                onChange={(e) => setWriteForm({ ...writeForm, title: e.target.value })}
                placeholder="제목을 입력하세요"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                required
              />
              <textarea
                data-testid="post-content-input"
                value={writeForm.content}
                onChange={(e) => setWriteForm({ ...writeForm, content: e.target.value })}
                placeholder="내용을 입력하세요"
                rows={6}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                required
              />
              <button
                data-testid="post-submit-button"
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                게시하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
