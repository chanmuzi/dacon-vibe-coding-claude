'use client';

import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Send, Search, Mail,
} from 'lucide-react';
import { useMessageStore } from '@/store/message';
import { useUserStore } from '@/store/user';
import { useRankingStore } from '@/store/ranking';
import { useTeamStore } from '@/store/team';
import GradeBadge from '@/components/GradeBadge';
import type { Message } from '@/types';

function InitialAvatar({ nickname, size = 'md' }: { nickname: string; size?: 'sm' | 'md' }) {
  const initials = nickname.slice(0, 2).toUpperCase();
  const cls = size === 'sm'
    ? 'w-8 h-8 text-xs'
    : 'w-10 h-10 text-sm';
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-primary-light text-primary font-bold select-none shrink-0 ${cls}`}>
      {initials}
    </span>
  );
}

function formatTime(raw: string): string {
  if (!raw) return '';
  const now = new Date();
  const d = new Date(raw);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}일 전`;
  return raw.slice(0, 10);
}

function formatMessageTime(raw: string): string {
  if (raw.length >= 16) return raw.slice(11, 16);
  return raw.slice(0, 10);
}

function ProfilePopover({ userId, nickname }: { userId: string; nickname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-semibold text-text-primary hover:text-primary transition-colors underline-offset-2 hover:underline cursor-pointer"
      >
        {nickname}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-sm py-1 min-w-[140px]">
          <Link
            href={`/users/${userId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            프로필 보기
          </Link>
        </div>
      )}
    </div>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toParam = searchParams.get('to');

  const { messages, addMessage, markConversationRead, getConversations, getThread } = useMessageStore();
  const { user, isLoggedIn, openAuthModal } = useUserStore();
  const rankings = useRankingStore((s) => s.rankings);
  const teams = useTeamStore((s) => s.teams);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(toParam);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'thread'>(toParam ? 'thread' : 'list');
  const [isComposing, setIsComposing] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const nicknameLookup = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of rankings) map[r.userId] = r.nickname;
    for (const t of teams) {
      for (const m of t.members) {
        if (!map[m.userId]) map[m.userId] = m.nickname;
      }
    }
    return map;
  }, [rankings, teams]);

  const conversations = useMemo(() => {
    if (!user) return [];
    return getConversations(user.id, nicknameLookup);
  }, [user, messages, nicknameLookup, getConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) =>
      c.partnerNickname.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const thread = useMemo(() => {
    if (!user || !selectedPartnerId) return [];
    return getThread(user.id, selectedPartnerId);
  }, [user, selectedPartnerId, messages, getThread]);

  const selectedPartnerNickname = selectedPartnerId ? (nicknameLookup[selectedPartnerId] || selectedPartnerId) : '';
  const selectedPartnerGrade = useMemo(() => {
    if (!selectedPartnerId) return null;
    return rankings.find((r) => r.userId === selectedPartnerId)?.grade || null;
  }, [selectedPartnerId, rankings]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  useEffect(() => {
    if (user && selectedPartnerId) {
      markConversationRead(user.id, selectedPartnerId);
    }
  }, [user, selectedPartnerId, markConversationRead]);

  useEffect(() => {
    if (toParam && user) {
      setSelectedPartnerId(toParam);
      setMobileView('thread');
    }
  }, [toParam, user]);

  function handleSend() {
    if (!messageText.trim() || !user || !selectedPartnerId) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      from: user.id,
      to: selectedPartnerId,
      content: messageText.trim(),
      type: 'dm',
      read: false,
      createdAt: new Date().toISOString().slice(0, 16),
    };
    addMessage(msg);
    setMessageText('');
  }

  function selectConversation(partnerId: string) {
    setSelectedPartnerId(partnerId);
    setMobileView('thread');
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Mail size={48} className="mx-auto text-text-secondary mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">메시지</h1>
        <p className="text-text-secondary mb-6">로그인 후 메시지를 확인할 수 있습니다.</p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all cursor-pointer active:scale-[0.98]"
        >
          로그인
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">메시지</h1>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Left: Conversation List */}
          <div className={`w-full md:w-80 md:border-r md:border-border flex flex-col shrink-0 ${mobileView === 'thread' ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="대화 검색..."
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-text-secondary text-sm">
                  {conversations.length === 0 ? '아직 대화가 없습니다.' : '검색 결과가 없습니다.'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const active = conv.partnerId === selectedPartnerId;
                  return (
                    <button
                      key={conv.partnerId}
                      onClick={() => selectConversation(conv.partnerId)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                        active ? 'bg-primary-light' : 'hover:bg-background'
                      }`}
                    >
                      <InitialAvatar nickname={conv.partnerNickname} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}>
                            {conv.partnerNickname}
                          </span>
                          <span className="text-xs text-text-secondary shrink-0">{formatTime(conv.lastAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Thread View */}
          <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {!selectedPartnerId ? (
              <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <Mail size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">대화를 선택하세요</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <button
                    onClick={() => { setMobileView('list'); setSelectedPartnerId(null); }}
                    className="md:hidden p-1 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <InitialAvatar nickname={selectedPartnerNickname} size="sm" />
                  <div className="flex items-center gap-2">
                    <ProfilePopover userId={selectedPartnerId} nickname={selectedPartnerNickname} />
                    {selectedPartnerGrade && <GradeBadge grade={selectedPartnerGrade} size="sm" />}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {thread.length === 0 && (
                    <div className="text-center text-text-secondary text-sm py-8">
                      <p>{selectedPartnerNickname}님과의 첫 대화를 시작해보세요.</p>
                    </div>
                  )}
                  {thread.map((msg) => {
                    const isMine = msg.from === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%]">
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-background text-text-primary rounded-bl-md'
                          }`}>
                            {msg.content}
                          </div>
                          <div className={`text-[10px] text-text-secondary mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(msg.createdAt)}
                            {isMine && msg.read && <span className="ml-1">읽음</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>

                {/* Input — IME-safe */}
                <div className="px-4 py-3 border-t border-border">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      rows={1}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim()}
                      className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <Suspense fallback={
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-text-primary mb-6">메시지</h1>
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-secondary">
            로딩 중...
          </div>
        </div>
      }>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
