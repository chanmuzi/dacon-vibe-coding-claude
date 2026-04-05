'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import 'katex/dist/katex.min.css';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  X,
  Check,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useCommunityStore } from '@/store/community';
import { useUserStore } from '@/store/user';
import { useRankingStore } from '@/store/ranking';
import { useTeamStore } from '@/store/team';
import { useMessageStore } from '@/store/message';
import Modal from '@/components/Modal';
import GradeBadge from '@/components/GradeBadge';
import type { Comment, Role, Message } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  developer: '개발자',
  designer: '디자이너',
  planner: '기획자',
  'data-scientist': '데이터 사이언티스트',
};
const APPLY_ROLES: Role[] = ['developer', 'designer', 'planner', 'data-scientist'];

interface ApplyForm { intro: string; positions: Role[]; techStack: string; portfolio: string; }

function buildDmContent(form: ApplyForm): string {
  const positions = form.positions.map((r) => ROLE_LABELS[r]).join(', ') || '미정';
  const parts = [`[자기소개]\n${form.intro}`, `[가능 포지션] ${positions}`];
  if (form.techStack.trim()) parts.push(`[기술스택] ${form.techStack}`);
  if (form.portfolio.trim()) parts.push(`[포트폴리오] ${form.portfolio}`);
  return parts.join('\n\n');
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  question: { label: '질문', cls: 'bg-info-light text-info' },
  tip: { label: '팁', cls: 'bg-success-light text-success' },
  'team-find': { label: '팀 구하기', cls: 'bg-type-qualitative text-white ring-1 ring-type-qualitative/30' },
  free: { label: '자유', cls: 'bg-background text-text-secondary' },
};

function formatDateTime(raw: string): string {
  if (raw.length >= 16) {
    const [date, time] = raw.split('T');
    return `${date} ${time || ''}`.trim();
  }
  return raw;
}

function InitialAvatar({ nickname }: { nickname: string }) {
  const initials = nickname.slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary text-xs font-bold select-none shrink-0">
      {initials}
    </span>
  );
}

interface AuthorPopoverProps {
  authorId: string;
  nickname: string;
}

function AuthorPopover({ authorId, nickname }: AuthorPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-medium text-text-primary hover:text-primary transition-colors underline-offset-2 hover:underline cursor-pointer"
      >
        {nickname}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-sm py-1 min-w-[140px]">
          <Link
            href={`/users/${authorId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            프로필 보기
          </Link>
          <Link
            href={`/messages?to=${authorId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            DM 보내기
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CommunityPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { posts, toggleLike, addComment, updatePost, deletePost, updateComment, deleteComment } = useCommunityStore();
  const { user, isLoggedIn } = useUserStore();
  const rankings = useRankingStore((s) => s.rankings);
  const teams = useTeamStore((s) => s.teams);
  const { addMessage } = useMessageStore();

  const post = posts.find((p) => p.id === id);

  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState<ApplyForm>({ intro: '', positions: [], techStack: '', portfolio: '' });
  const [applyToast, setApplyToast] = useState('');

  function toggleApplyPosition(role: Role) {
    setApplyForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(role)
        ? prev.positions.filter((r) => r !== role)
        : [...prev.positions, role],
    }));
  }

  function handleSendApply(teamId: string) {
    if (!applyForm.intro.trim() || !user) return;
    const team = teams.find((t) => t.id === teamId);
    const leader = team?.members[0];
    if (!leader) return;
    addMessage({
      id: `msg-${Date.now()}`,
      from: user.id,
      to: leader.userId,
      content: buildDmContent(applyForm),
      type: 'team-request',
      teamId,
      read: false,
      createdAt: new Date().toISOString(),
    });
    setApplyForm({ intro: '', positions: [], techStack: '', portfolio: '' });
    setShowApplyModal(false);
    setApplyToast('참가 신청이 전송되었습니다!');
    setTimeout(() => setApplyToast(''), 3000);
  }

  const liked = user ? post?.likedBy.includes(user.id) ?? false : false;
  const isAuthor = user && post ? user.id === post.authorId : false;

  function getGrade(authorId: string): string | null {
    const rank = rankings.find((r) => r.userId === authorId);
    return rank?.grade || null;
  }

  function handleToggleLike() {
    if (!isLoggedIn || !user || !post) return;
    toggleLike(post.id, user.id);
  }

  function handleAddComment() {
    if (!commentText.trim() || !post) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user?.id ?? 'anonymous',
      authorNickname: user?.nickname ?? '익명',
      content: commentText,
      createdAt: new Date().toISOString().slice(0, 16),
    };
    addComment(post.id, comment);
    setCommentText('');
  }

  function handleStartEdit() {
    if (!post) return;
    setEditContent(post.content);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    if (!post || !editContent.trim()) return;
    updatePost(post.id, { content: editContent }, user!.id);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditContent('');
  }

  function handleDelete() {
    if (!post) return;
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      router.push('/community');
      deletePost(post.id, user!.id);
    }
  }

  function handleStartEditComment(c: Comment) {
    setEditingCommentId(c.id);
    setEditingCommentText(c.content);
  }

  function handleSaveEditComment(commentId: string) {
    if (!post || !editingCommentText.trim()) return;
    updateComment(post.id, commentId, editingCommentText, user!.id);
    setEditingCommentId(null);
    setEditingCommentText('');
  }

  function handleDeleteComment(commentId: string) {
    if (!post) return;
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      deleteComment(post.id, commentId, user!.id);
    }
  }

  if (!post) notFound();

  const badge = TYPE_BADGE[post.type];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {/* Back button */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        커뮤니티
      </Link>

      {/* Post card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
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
                  <Link
                    href={`/teams/${authorTeam.id}`}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-type-qualitative-light text-type-qualitative hover:underline"
                  >
                    <ExternalLink size={10} /> 팀 보러가기
                  </Link>
                ) : null;
              })()}
            </div>
            <h1 className="text-2xl font-bold text-text-primary leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <InitialAvatar nickname={post.authorNickname} />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <AuthorPopover authorId={post.authorId} nickname={post.authorNickname} />
                {(() => {
                  const g = getGrade(post.authorId);
                  return g ? <GradeBadge grade={g} size="sm" /> : null;
                })()}
                <span>·</span>
                <span>{formatDateTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Hackathon tag — top right */}
          <div className="flex items-center gap-2 shrink-0">
            {post.hackathonTag && (
              <span className="text-xs bg-primary-light text-primary px-2.5 py-0.5 rounded-full font-medium">
                {post.hackathonTag}
              </span>
            )}
            {/* Edit / Delete for author */}
            {isAuthor && !isEditing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEdit}
                  title="수정"
                  className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary transition-colors cursor-pointer active:scale-95"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  title="삭제"
                  className="p-2 rounded-lg text-text-secondary hover:bg-error-light hover:text-error transition-colors cursor-pointer active:scale-95"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="border-t border-border pt-5">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:ring-2 focus:ring-primary-light focus:border-primary resize-y font-mono"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-background text-sm transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <X size={14} /> 취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <Check size={14} /> 저장
                </button>
              </div>
            </div>
          ) : (
            <div className="prose-content text-sm text-text-primary leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeKatex, rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-text-primary mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-text-primary mt-5 mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed">{children}</p>
                  ),
                  code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
                    inline ? (
                      <code
                        className="bg-background px-1.5 py-0.5 rounded text-sm font-mono text-text-primary"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ),
                  pre: ({ children }) => (
                    <pre className="bg-background rounded-lg p-4 overflow-x-auto font-mono text-sm my-4">
                      {children}
                    </pre>
                  ),
                  a: ({ href, children }) => {
                    const safe = href && (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('/'));
                    return safe ? (
                      <a
                        href={href}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ) : <span className="text-primary">{children}</span>;
                  },
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 mb-3 pl-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 mb-3 pl-2">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-text-primary">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-light pl-4 my-4 text-text-secondary italic">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border-collapse text-sm">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-3 py-2 bg-background font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-3 py-2">{children}</td>
                  ),
                  hr: () => <hr className="border-border my-5" />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Team-find CTA */}
        {post.type === 'team-find' && (() => {
          const authorTeam = post.teamId
            ? teams.find((t) => t.id === post.teamId)
            : teams.find((t) =>
                t.members.some((m) => m.userId === post.authorId) &&
                (!post.hackathonTag || t.hackathonSlugs?.includes(post.hackathonTag))
              );
          if (!authorTeam) return null;
          return (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-type-qualitative-light border border-type-qualitative/20">
                <div>
                  <p className="text-sm font-semibold text-type-qualitative">{authorTeam.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {authorTeam.members.length}/{authorTeam.maxMembers}명 · {authorTeam.recruitRoles.map((r) => r === 'developer' ? '개발자' : r === 'designer' ? '디자이너' : r === 'planner' ? '기획자' : '데이터 사이언티스트').join(', ')} 모집 중
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isLoggedIn) { useUserStore.getState().openAuthModal(); return; }
                    setShowApplyModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-type-qualitative text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                  <Users size={14} /> 참가 신청하기
                </button>
              </div>
            </div>
          );
        })()}

        {/* Actions — inline like button */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-border">
            <button
              onClick={handleToggleLike}
              className="flex items-center gap-1.5 text-sm cursor-pointer active:scale-95 transition-all"
            >
              <Heart
                size={18}
                fill={liked ? 'currentColor' : 'none'}
                className={`transition-all duration-200 ${liked ? 'text-primary scale-110' : 'text-text-secondary hover:text-primary'}`}
              />
              <span className={`font-medium ${liked ? 'text-primary' : 'text-text-secondary'}`}>{post.likes}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <MessageSquare size={18} />
              <span className="font-medium">{post.comments.length}</span>
            </span>
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-text-primary mb-5">
          댓글 {post.comments.length}개
        </h2>

        {post.comments.length === 0 ? (
          <p className="text-text-secondary text-sm mb-5">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
          </p>
        ) : (
          <div className="divide-y divide-border mb-6">
            {post.comments.map((c) => {
              const isCommentAuthor = user?.id === c.authorId;
              const commentGrade = getGrade(c.authorId);
              const isEditingThis = editingCommentId === c.id;

              return (
                <div key={c.id} className="py-4 first:pt-0">
                  <div className="flex items-center gap-2 mb-2">
                    <InitialAvatar nickname={c.authorNickname} />
                    <Link
                      href={`/users/${c.authorId}`}
                      className="text-sm font-medium text-text-primary hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                      {c.authorNickname}
                    </Link>
                    {commentGrade && <GradeBadge grade={commentGrade} size="sm" />}
                    <span className="text-xs text-text-secondary">{formatDateTime(c.createdAt)}</span>
                    {isCommentAuthor && !isEditingThis && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => handleStartEditComment(c)}
                          title="수정"
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          title="삭제"
                          className="p-1 rounded text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditingThis ? (
                    <div className="pl-10 space-y-2">
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows={2}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary-light resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                          className="px-3 py-1 rounded-lg border border-border text-text-secondary text-xs hover:bg-background transition-colors cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEditComment(c.id)}
                          className="px-3 py-1 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-primary leading-relaxed pl-10">{c.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Comment form — aligned input + button */}
        <div className="flex items-end gap-3 pt-4 border-t border-border">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'}
            disabled={!isLoggedIn}
            rows={2}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-light focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={!isLoggedIn || !commentText.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            전송
          </button>
        </div>
      </div>

      {/* Apply toast */}
      {applyToast && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <Check size={16} /> {applyToast}
        </div>
      )}

      {/* Apply Modal — same rich form as camp/team pages */}
      {post.type === 'team-find' && (() => {
        const applyTeamId = post.teamId || null;
        const applyTeam = applyTeamId ? teams.find((t) => t.id === applyTeamId) : null;
        if (!applyTeam) return null;
        return (
          <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} maxWidth="max-w-md">
            <h2 className="text-lg font-bold text-text-primary mb-4">참가 신청 — {applyTeam.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  자기소개 <span className="text-error text-xs">*</span>
                </label>
                <textarea
                  value={applyForm.intro}
                  onChange={(e) => setApplyForm({ ...applyForm, intro: e.target.value })}
                  placeholder="자기소개와 참가 동기를 작성해주세요..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">가능 포지션</label>
                <div className="flex flex-wrap gap-2">
                  {APPLY_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleApplyPosition(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                        applyForm.positions.includes(r)
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">기술스택</label>
                <input
                  type="text"
                  value={applyForm.techStack}
                  onChange={(e) => setApplyForm({ ...applyForm, techStack: e.target.value })}
                  placeholder="React, Python, Figma ... (쉼표로 구분)"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  포트폴리오 링크 <span className="text-text-secondary text-xs">(선택)</span>
                </label>
                <input
                  type="url"
                  value={applyForm.portfolio}
                  onChange={(e) => setApplyForm({ ...applyForm, portfolio: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
              <button
                onClick={() => handleSendApply(applyTeam.id)}
                disabled={!applyForm.intro.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                <Send size={16} /> 신청 보내기
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
