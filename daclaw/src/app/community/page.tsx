'use client';

import { useState, useMemo } from 'react';
import { useCommunityStore } from '@/store/community';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import {
  MessageSquare, ThumbsUp, Plus, X, Send, ChevronDown, HelpCircle, Lightbulb, Users, MessageCircle,
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
  question: { label: '질문', cls: 'bg-blue-100 text-blue-700' },
  tip: { label: '팁', cls: 'bg-green-100 text-green-700' },
  'team-find': { label: '팀 구하기', cls: 'bg-purple-100 text-purple-700' },
  free: { label: '자유', cls: 'bg-gray-100 text-gray-600' },
};

export default function CommunityPage() {
  const { posts, addPost, addComment, toggleLike } = useCommunityStore();
  const { hackathons } = useHackathonStore();
  const { user, isLoggedIn } = useUserStore();

  const [typeFilter, setTypeFilter] = useState('all');
  const [hackFilter, setHackFilter] = useState('all');
  const [showWrite, setShowWrite] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [writeForm, setWriteForm] = useState({ title: '', content: '', type: 'free' as CommunityPost['type'], hackathonTag: '' });

  const filtered = useMemo(() => {
    let result = posts;
    if (typeFilter !== 'all') result = result.filter((p) => p.type === typeFilter);
    if (hackFilter !== 'all') result = result.filter((p) => p.hackathonTag === hackFilter);
    return result;
  }, [posts, typeFilter, hackFilter]);

  function handleWritePost(e: React.FormEvent) {
    e.preventDefault();
    if (!writeForm.title.trim() || !writeForm.content.trim()) return;
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      type: writeForm.type,
      title: writeForm.title,
      content: writeForm.content,
      authorId: user?.id ?? 'anonymous',
      authorNickname: user?.nickname ?? '익명',
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

  function handleAddComment(postId: string) {
    if (!commentText.trim()) return;
    addComment(postId, {
      id: `c-${Date.now()}`,
      authorId: user?.id ?? 'anonymous',
      authorNickname: user?.nickname ?? '익명',
      content: commentText,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setCommentText('');
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
          onClick={() => setShowWrite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> 글쓰기
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
            게시글이 없습니다. 첫 글을 작성해보세요!
          </div>
        ) : filtered.map((post) => {
          const badge = TYPE_BADGE[post.type];
          const expanded = expandedId === post.id;
          const hackTitle = hackathons.find((h) => h.slug === post.hackathonTag)?.title;
          const liked = user ? post.likedBy.includes(user.id) : false;

          return (
            <div key={post.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary-light transition-colors">
              {/* Header */}
              <button
                className="w-full text-left p-5"
                onClick={() => setExpandedId(expanded ? null : post.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                      {hackTitle && <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">{hackTitle}</span>}
                    </div>
                    <h3 className="font-semibold text-text-primary">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                      <span>{post.authorNickname}</span>
                      <span>{post.createdAt}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments.length}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expanded && (
                <div className="border-t border-border px-5 pb-5">
                  <div className="py-4 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{post.content}</div>

                  {/* Like Button */}
                  <button
                    onClick={() => user && toggleLike(post.id, user.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mb-4 ${
                      liked ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                    }`}
                  >
                    <ThumbsUp size={14} /> {liked ? '좋아요 취소' : '좋아요'} ({post.likes})
                  </button>

                  {/* Comments */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-primary">댓글 ({post.comments.length})</h4>
                    {post.comments.map((c) => (
                      <div key={c.id} className="bg-background rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                          <span className="font-medium text-text-primary">{c.authorNickname}</span>
                          <span>{c.createdAt}</span>
                        </div>
                        <p className="text-sm text-text-primary">{c.content}</p>
                      </div>
                    ))}
                    {/* Comment Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={expandedId === post.id ? commentText : ''}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Write Modal */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">게시글 작성</h2>
              <button onClick={() => setShowWrite(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
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
