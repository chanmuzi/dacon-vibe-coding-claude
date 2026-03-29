'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
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
} from 'lucide-react';
import { useCommunityStore } from '@/store/community';
import { useUserStore } from '@/store/user';
import type { Comment } from '@/types';

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  question: { label: '질문', cls: 'bg-info-light text-info' },
  tip: { label: '팁', cls: 'bg-success-light text-success' },
  'team-find': { label: '팀 구하기', cls: 'bg-type-qualitative-light text-type-qualitative' },
  free: { label: '자유', cls: 'bg-background text-text-secondary' },
};

function InitialAvatar({ nickname }: { nickname: string }) {
  const initials = nickname.slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary text-xs font-bold select-none">
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
        className="font-medium text-text-primary hover:text-primary transition-colors underline-offset-2 hover:underline"
      >
        {nickname}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-sm py-1 min-w-[140px]">
          <Link
            href={`/users/${authorId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
            onClick={() => setOpen(false)}
          >
            프로필 보기
          </Link>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
            onClick={() => {
              alert(`${nickname}님에게 DM 기능은 준비 중입니다.`);
              setOpen(false);
            }}
          >
            DM 보내기
          </button>
        </div>
      )}
    </div>
  );
}

export default function CommunityPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { posts, toggleLike, addComment, updatePost, deletePost } = useCommunityStore();
  const { user, isLoggedIn } = useUserStore();

  const post = posts.find((p) => p.id === id);

  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const liked = user ? post?.likedBy.includes(user.id) ?? false : false;
  const isAuthor = user && post ? user.id === post.authorId : false;

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
      createdAt: new Date().toISOString().slice(0, 10),
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
    updatePost(post.id, { content: editContent });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditContent('');
  }

  function handleDelete() {
    if (!post) return;
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      deletePost(post.id);
      router.push('/community');
    }
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border rounded-xl shadow-sm p-12 text-center">
          <p className="text-text-secondary text-lg mb-4">포스트를 찾을 수 없습니다.</p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const badge = TYPE_BADGE[post.type];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {badge.label}
              </span>
              {post.hackathonTag && (
                <span className="text-xs bg-primary-light text-primary px-2.5 py-0.5 rounded-full font-medium">
                  {post.hackathonTag}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-text-primary leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <InitialAvatar nickname={post.authorNickname} />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <AuthorPopover authorId={post.authorId} nickname={post.authorNickname} />
                <span>·</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Edit / Delete for author */}
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleStartEdit}
                title="수정"
                className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                title="삭제"
                className="p-2 rounded-lg text-text-secondary hover:bg-error-light hover:text-error transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-background text-sm transition-colors"
                >
                  <X size={14} /> 취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm transition-colors"
                >
                  <Check size={14} /> 저장
                </button>
              </div>
            </div>
          ) : (
            <div className="prose-content text-sm text-text-primary leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
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
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
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

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-border">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                liked
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
              }`}
            >
              <Heart
                size={16}
                className={liked ? 'fill-current' : ''}
              />
              {post.likes}
            </button>
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <MessageSquare size={16} />
              {post.comments.length}
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
          <div className="space-y-4 mb-6">
            {post.comments.map((c) => (
              <div key={c.id} className="bg-background rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <InitialAvatar nickname={c.authorNickname} />
                  <span className="text-sm font-medium text-text-primary">{c.authorNickname}</span>
                  <span className="text-xs text-text-secondary">{c.createdAt}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed pl-10">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        <div className="flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'}
            disabled={!isLoggedIn}
            rows={2}
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-light focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={!isLoggedIn || !commentText.trim()}
            className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
