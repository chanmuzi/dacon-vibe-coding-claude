'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCommunityStore } from '@/store/community';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import { useTeamStore } from '@/store/team';
import {
  MessageSquare, Heart, Plus, HelpCircle, Lightbulb, Users, MessageCircle, Search, ExternalLink,
} from 'lucide-react';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import type { CommunityPost } from '@/types';

const POST_TYPES = [
  { value: 'question', label: '질문', icon: HelpCircle },
  { value: 'tip', label: '팁', icon: Lightbulb },
  { value: 'team-find', label: '팀 구하기', icon: Users },
  { value: 'free', label: '자유', icon: MessageCircle },
] as const;

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  question: { label: '질문', cls: 'bg-info-light text-info' },
  tip: { label: '팁', cls: 'bg-success-light text-success' },
  'team-find': { label: '팀 구하기', cls: 'bg-type-qualitative text-white ring-1 ring-type-qualitative/30' },
  free: { label: '자유', cls: 'bg-background text-text-secondary' },
};

type SortKey = 'latest' | 'popular' | 'comments';

export default function CommunityPage() {
  const { posts, addPost, toggleLike } = useCommunityStore();
  const { hackathons } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal } = useUserStore();
  const teams = useTeamStore((s) => s.teams);
  const router = useRouter();
  const [heartAnimIds, setHeartAnimIds] = useState<Set<string>>(new Set());

  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [hackFilter, setHackFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [showWrite, setShowWrite] = useState(false);
  const [writeForm, setWriteForm] = useState({ title: '', content: '', type: 'free' as CommunityPost['type'], hackathonTag: '' });

  const hackSelectOptions = useMemo(() => [
    { value: 'all', label: '모든 해커톤' },
    ...hackathons.map((h) => ({ value: h.slug, label: h.title })),
  ], [hackathons]);

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'comments', label: '댓글순' },
  ];

  const writeHackOptions = useMemo(() => [
    { value: '', label: '해커톤 태그 (선택)' },
    ...hackathons.map((h) => ({ value: h.slug, label: h.title })),
  ], [hackathons]);

  const filtered = useMemo(() => {
    let result = posts;
    if (typeFilters.size > 0) result = result.filter((p) => typeFilters.has(p.type));
    if (hackFilter !== 'all') result = result.filter((p) => p.hackathonTag === hackFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    if (sortKey === 'latest') result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortKey === 'popular') result = [...result].sort((a, b) => b.likes - a.likes);
    if (sortKey === 'comments') result = [...result].sort((a, b) => b.comments.length - a.comments.length);
    return result;
  }, [posts, typeFilters, hackFilter, searchQuery, sortKey]);

  function toggleTypeFilter(value: string) {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

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
      createdAt: new Date().toISOString().slice(0, 16),
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
    const post = posts.find((p) => p.id === postId);
    const wasLiked = post ? post.likedBy.includes(user.id) : false;
    toggleLike(postId, user.id);
    if (!wasLiked) {
      setHeartAnimIds((prev) => new Set(prev).add(postId));
      setTimeout(() => setHeartAnimIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      }), 500);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
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
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <Plus size={14} /> 글쓰기
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

        {/* Type filter chips — multi-select */}
        <div className="flex gap-1">
          {POST_TYPES.map((t) => {
            const Icon = t.icon;
            const active = typeFilters.has(t.value);
            return (
              <button
                key={t.value}
                onClick={() => toggleTypeFilter(t.value)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  active ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
          {typeFilters.size > 0 && (
            <button
              onClick={() => setTypeFilters(new Set())}
              className="px-2 py-2 rounded-lg text-xs text-text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              초기화
            </button>
          )}
        </div>

        {/* Hackathon filter — CustomSelect */}
        <CustomSelect
          value={hackFilter}
          onChange={setHackFilter}
          options={hackSelectOptions}
        />

        {/* Sort — CustomSelect */}
        <div className="ml-auto">
          <CustomSelect
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={sortOptions}
          />
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
          const rawSummary = post.summary ?? post.content.slice(0, 100);
          const summary = post.content.length > 100 ? rawSummary.replace(/\.{3}$/, '') + '…' : rawSummary;

          return (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="flex items-start gap-4 bg-surface border border-border rounded-xl p-5 hover:border-primary-light transition-colors"
            >
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${badge.cls}`}>
                      {post.type === 'team-find' && <Users size={10} className="inline mr-0.5 -mt-px" />}
                      {badge.label}
                    </span>
                    {post.type === 'team-find' && (() => {
                      const authorTeam = post.teamId
                        ? teams.find((t) => t.id === post.teamId)
                        : teams.find((t) =>
                            t.members.some((m) => m.userId === post.authorId) &&
                            (!post.hackathonTag || t.hackathonSlugs?.includes(post.hackathonTag))
                          );
                      return authorTeam ? (
                        <span
                          role="link"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            router.push(`/teams/${authorTeam.id}`);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-type-qualitative-light text-type-qualitative hover:underline cursor-pointer active:scale-95 transition-all"
                        >
                          <Users size={10} /> 참가 신청하기
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {hackathon && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-auto"
                      style={{ backgroundColor: hackathon.color + '20', color: hackathon.color }}
                    >
                      {hackathon.title}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary mb-1 leading-snug">{post.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-2">{summary}</p>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/users/${post.authorId}`); }}
                    className="font-medium hover:text-primary transition-colors underline-offset-2 hover:underline cursor-pointer"
                  >
                    {post.authorNickname}
                  </span>
                  <span>{post.createdAt.slice(0, 10)}</span>
                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer active:scale-95"
                  >
                    <Heart
                      size={14}
                      fill={liked ? 'currentColor' : 'none'}
                      className={`transition-all duration-200 ${liked ? 'text-primary scale-110' : ''} ${heartAnimIds.has(post.id) ? 'heart-pop' : ''}`}
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
      <Modal isOpen={showWrite} onClose={() => setShowWrite(false)} maxWidth="max-w-lg">
        <h2 className="text-lg font-bold mb-4">게시글 작성</h2>
        <form onSubmit={handleWritePost} className="space-y-4">
          <div className="flex gap-2">
            {(['question', 'tip', 'team-find', 'free'] as const).map((t) => {
              const b = TYPE_BADGE[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWriteForm({ ...writeForm, type: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                    writeForm.type === t ? 'bg-primary text-white' : `${b.cls}`
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          <CustomSelect
            value={writeForm.hackathonTag}
            onChange={(v) => setWriteForm({ ...writeForm, hackathonTag: v })}
            options={writeHackOptions}
            className="w-full"
          />
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
            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
          >
            게시하기
          </button>
        </form>
      </Modal>
    </div>
  );
}
