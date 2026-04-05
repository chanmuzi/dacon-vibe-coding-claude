'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Users, Calendar, Clock,
  Trophy, Medal, Award, FileText, MessageSquare, Send, Download, Copy, ExternalLink,
  Pin, Check, CheckCircle2, Circle, BarChart3, Star,
  Building2, Terminal, Code, ChevronDown, Bell,
} from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useSubmissionStore } from '@/store/submission';
import { useUserStore } from '@/store/user';
import type { Hackathon } from '@/types';

const TABS = [
  { id: 'overview', label: '개요', icon: FileText },
  { id: 'team', label: '팀', icon: Users },
  { id: 'evaluation', label: '평가', icon: BarChart3 },
  { id: 'prize', label: '상금', icon: Trophy },
  { id: 'notice', label: '안내', icon: MessageSquare },
  { id: 'schedule', label: '일정', icon: Calendar },
  { id: 'submit', label: '제출', icon: Send },
  { id: 'leaderboard', label: '리더보드', icon: Star },
] as const;

type TabId = (typeof TABS)[number]['id'];

// Module-level helpers — extracted to satisfy React purity rules
function generateMockScore(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return Math.round((60 + (arr[0] % 3500) / 100) * 10) / 10;
}
function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  quantitative: { label: '정량 평가', cls: 'bg-type-quantitative/90 text-text-on-primary' },
  qualitative: { label: '정성 평가', cls: 'bg-type-qualitative/90 text-text-on-primary' },
  hybrid: { label: '혼합 평가', cls: 'bg-type-hybrid/90 text-text-on-primary' },
};

const IDE_OPTIONS = [
  { label: 'Cursor', icon: Terminal, action: 'cursor' },
  { label: 'VS Code', icon: Code, action: 'vscode' },
  { label: 'ChatGPT', icon: ExternalLink, action: 'chatgpt' },
  { label: 'Claude', icon: ExternalLink, action: 'claude' },
  { label: '클립보드 복사', icon: Copy, action: 'copy' },
] as const;

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function formatPrizeTotal(prizes: Hackathon['prizes']): string {
  // Sum numeric amounts from prize strings like "300만원", "1,000만원"
  let total = 0;
  for (const p of prizes) {
    const match = p.amount.replace(/,/g, '').match(/(\d+)/);
    if (match) total += parseInt(match[1], 10);
  }
  if (total === 0) return prizes[0]?.amount ?? '-';
  return `${total.toLocaleString()}만원`;
}

// Simple mini calendar component for submit tab
function MiniCalendar({ startDate, endDate }: { startDate: string; endDate: string }) {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Show the month that contains the end date (or start date if same month)
  const displayDate = end;
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function cellClass(day: number | null): string {
    if (day === null) return '';
    const date = new Date(year, month, day);
    const isStart = date.toDateString() === start.toDateString();
    const isEnd = date.toDateString() === end.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const inRange = date >= start && date <= end;

    if (isStart) return 'bg-primary-light text-primary font-bold rounded-full';
    if (isEnd) return 'bg-error-light text-error font-bold rounded-full';
    if (isToday && inRange) return 'bg-warning-light text-warning font-bold rounded-full';
    if (inRange) return 'bg-primary-light/40 text-primary text-xs';
    return 'text-text-secondary';
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm text-text-primary">{year}년 {MONTHS[month]}</span>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary-light inline-block" />시작</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-error-light inline-block" />종료</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning-light inline-block" />오늘</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-text-secondary py-1">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={`text-xs py-1 flex items-center justify-center h-7 w-7 mx-auto ${cellClass(day)}`}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { getBySlug, isBookmarked, toggleBookmark } = useHackathonStore();
  const { teams } = useTeamStore();
  const { submissions, addSubmission, getLeaderboard, updateLeaderboard } = useSubmissionStore();
  const { user, isLoggedIn } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [toast, setToast] = useState('');
  const [submitForm, setSubmitForm] = useState({ content: '', memo: '', fileName: '', fileSize: '' });
  const [ideDropdownOpen, setIdeDropdownOpen] = useState(false);
  const ideDropdownRef = useRef<HTMLDivElement>(null);

  const hackathon = getBySlug(slug);
  const hackTeams = teams.filter((t) => t.hackathonSlugs?.includes(slug));
  const allHackSubs = submissions.filter((s) => s.hackathonSlug === slug);
  const myTeamIds = new Set(
    teams.filter((t) => t.hackathonSlugs?.includes(slug) && t.members.some((m) => m.userId === user?.id)).map((t) => t.id)
  );
  const hackSubs = allHackSubs.filter((s) => myTeamIds.has(s.teamId) || s.teamId === `solo-${user?.id}`);
  const leaderboard = getLeaderboard(slug);
  const bookmarked = isBookmarked(slug);

  // My teams for this hackathon
  const myTeamsForHack = hackTeams.filter((t) => t.members.some((m) => m.userId === user?.id));

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Close IDE dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ideDropdownRef.current && !ideDropdownRef.current.contains(e.target as Node)) {
        setIdeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!hackathon) notFound();

  const badge = TYPE_BADGE[hackathon.type];
  const daysToEnd = daysUntil(hackathon.endDate);
  const daysToStart = daysUntil(hackathon.startDate);

  function handleSubmit() {
    if (!submitForm.content.trim() || !hackathon || !isLoggedIn || !user) return;
    const myTeam = hackTeams.find((t) => t.members.some((m) => m.userId === user.id));
    if (!hackathon.teamPolicy.solo && !myTeam) return;
    const teamId = myTeam?.id ?? `solo-${user.id}`;
    const teamName = myTeam?.name ?? user?.nickname ?? '익명';
    const version = hackSubs.filter((s) => s.teamId === teamId).length + 1;
    const score = hackathon.type !== 'qualitative' ? generateMockScore() : undefined;
    const sub = {
      id: generateId('sub'),
      hackathonSlug: slug,
      teamId,
      version,
      content: submitForm.content,
      memo: submitForm.memo,
      fileName: submitForm.fileName || undefined,
      fileSize: submitForm.fileSize ? Number(submitForm.fileSize) : undefined,
      score,
      createdAt: todayString(),
    };
    addSubmission(sub);
    if (score !== undefined) updateLeaderboard(slug, teamId, teamName, score);
    setSubmitForm({ content: '', memo: '', fileName: '', fileSize: '' });
    setToast('제출이 완료되었습니다!');
  }

  function handleDownloadJSON() {
    if (!hackathon) return;
    const data = { title: hackathon.title, type: hackathon.type, description: hackathon.description, tags: hackathon.tags, dates: { start: hackathon.startDate, end: hackathon.endDate }, metrics: hackathon.metrics, evaluationCriteria: hackathon.evaluationCriteria };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${slug}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleIdeAction(action: string) {
    if (!hackathon) return;
    setIdeDropdownOpen(false);
    if (action === 'cursor') {
      window.open(`cursor://open?url=${encodeURIComponent(hackathon.title)}`, '_self');
    } else if (action === 'vscode') {
      window.open('vscode://', '_self');
    } else if (action === 'chatgpt') {
      window.open('https://chat.openai.com', '_blank');
    } else if (action === 'claude') {
      window.open('https://claude.ai', '_blank');
    } else if (action === 'copy') {
      navigator.clipboard.writeText(hackathon.description);
      setToast('설명이 클립보드에 복사되었습니다');
    }
  }

  // Sidebar CTA logic
  function handleSidebarCTA() {
    if (!hackathon) return;
    if (hackathon.status === 'active') {
      setActiveTab('submit');
    } else if (hackathon.status === 'ended') {
      setActiveTab('leaderboard');
    }
  }

  // Accent color from hackathon.color (used as inline style for border accent)
  const accentStyle = hackathon.color ? { borderTopColor: hackathon.color } : {};

  // Sidebar component (shared logic, rendered in two places)
  const SidebarContent = (
    <div className="space-y-4">
      {/* Prize card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6" style={accentStyle}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} className="text-warning" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">총 상금</span>
        </div>
        <p className="font-mono text-3xl font-bold text-text-primary mt-1">{formatPrizeTotal(hackathon.prizes)}</p>
        <div className="mt-3 space-y-1">
          {hackathon.prizes.map((p) => (
            <div key={p.rank} className="flex justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                {p.rank === 1 && <Trophy size={12} className="text-warning" />}
                {p.rank === 2 && <Medal size={12} className="text-text-secondary" />}
                {p.rank === 3 && <Award size={12} className="text-warning" />}
                {p.rank > 3 && <span className="w-3" />}
                {p.label}
              </span>
              <span className="font-mono font-semibold text-primary">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">현황</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-mono font-bold text-lg text-text-primary">{hackathon.participantCount.toLocaleString()}</p>
            <p className="text-xs text-text-secondary mt-0.5">참가자</p>
          </div>
          <div>
            <p className="font-mono font-bold text-lg text-text-primary">{hackTeams.length}</p>
            <p className="text-xs text-text-secondary mt-0.5">팀</p>
          </div>
          <div>
            <p className="font-mono font-bold text-lg text-text-primary">{allHackSubs.length}</p>
            <p className="text-xs text-text-secondary mt-0.5">제출</p>
          </div>
        </div>
      </div>

      {/* Deadline card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={15} className="text-text-secondary" />
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">마감</h3>
        </div>
        {hackathon.status === 'ended' ? (
          <p className="font-medium text-text-secondary">종료됨</p>
        ) : hackathon.status === 'upcoming' ? (
          <div>
            <p className="font-mono text-2xl font-bold text-info">D-{daysToStart}</p>
            <p className="text-xs text-text-secondary mt-1">시작일: {hackathon.startDate}</p>
          </div>
        ) : (
          <div>
            {daysToEnd > 0 ? (
              <p className="font-mono text-2xl font-bold text-primary">D-{daysToEnd}</p>
            ) : (
              <p className="font-mono text-2xl font-bold text-error">오늘 마감</p>
            )}
            <p className="text-xs text-text-secondary mt-1">종료일: {hackathon.endDate}</p>
          </div>
        )}
      </div>

      {/* CTA button */}
      {hackathon.status === 'active' && (
        <button
          onClick={handleSidebarCTA}
          className="w-full px-4 py-3 bg-primary text-text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={16} /> 제출하기
        </button>
      )}
      {hackathon.status === 'upcoming' && (
        <button
          disabled
          className="w-full px-4 py-3 bg-border text-text-secondary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
        >
          <Bell size={16} /> 알림 받기
        </button>
      )}
      {hackathon.status === 'ended' && (
        <button
          onClick={handleSidebarCTA}
          className="w-full px-4 py-3 bg-surface border border-border text-text-primary rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Star size={16} /> 결과 보기
        </button>
      )}

      {/* Organizer card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-text-secondary">주최</p>
          <p className="font-semibold text-text-primary text-sm">{hackathon.organizer}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div data-testid="toast-message" className="fixed top-20 right-4 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.push('/hackathons')} className="flex items-center gap-1 text-text-secondary hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} /> 목록으로
      </button>

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-56">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40"
          style={hackathon.thumbnailUrl ? { backgroundImage: `url(${hackathon.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          {/* Organizer above title */}
          <p className="text-xs text-white/70 mb-1 flex items-center gap-1">
            <Building2 size={12} /> {hackathon.organizer}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
            {/* J5: Status badges */}
            {hackathon.status === 'active' && (
              <span className="bg-success text-text-on-primary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> 진행 중
              </span>
            )}
            {hackathon.status === 'upcoming' && (
              <span className="bg-info text-text-on-primary px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold">
                D-{daysToStart}
              </span>
            )}
            {hackathon.status === 'ended' && (
              <span className="bg-text-secondary text-text-on-primary px-2.5 py-0.5 rounded-full text-xs font-medium">종료됨</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{hackathon.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Users size={14} /> {hackathon.participantCount.toLocaleString()}명</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {hackathon.startDate} ~ {hackathon.endDate}</span>
          </div>
        </div>
        <button
          onClick={() => toggleBookmark(slug)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
        >
          {bookmarked ? <BookmarkCheck size={20} className="text-warning" /> : <Bookmark size={20} className="text-white" />}
        </button>
      </div>

      {/* Mobile sidebar card (shown above tabs on mobile) */}
      <div className="lg:hidden mb-6">
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
          {/* Prize */}
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-warning" />
            <div>
              <p className="text-xs text-text-secondary">총 상금</p>
              <p className="font-mono font-bold text-text-primary">{formatPrizeTotal(hackathon.prizes)}</p>
            </div>
          </div>
          {/* Deadline */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">마감</p>
              {hackathon.status === 'ended' ? (
                <p className="font-medium text-sm text-text-secondary">종료됨</p>
              ) : hackathon.status === 'upcoming' ? (
                <p className="font-mono font-bold text-info text-sm">D-{daysToStart}</p>
              ) : (
                <p className="font-mono font-bold text-primary text-sm">{daysToEnd > 0 ? `D-${daysToEnd}` : '오늘 마감'}</p>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-2">
            <Users size={16} className="text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">참가자</p>
              <p className="font-mono font-bold text-text-primary text-sm">{hackathon.participantCount.toLocaleString()}명</p>
            </div>
          </div>
          {/* CTA */}
          {hackathon.status === 'active' && (
            <button
              onClick={handleSidebarCTA}
              className="px-4 py-2 bg-primary text-text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Send size={14} /> 제출하기
            </button>
          )}
          {hackathon.status === 'ended' && (
            <button
              onClick={handleSidebarCTA}
              className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Star size={14} /> 결과 보기
            </button>
          )}
        </div>
      </div>

      {/* J3: Sticky tab navigation */}
      <div className="sticky top-16 z-10 bg-background -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex overflow-x-auto gap-1 border-b border-border pb-px scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-text-secondary hover:text-primary/70 cursor-pointer'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main layout: content + desktop sidebar */}
      <div className="flex gap-8">
        {/* Tab Content */}
        <main className="flex-1 min-w-0">
          <div className="min-h-[400px]">

            {/* Overview */}
            {activeTab === 'overview' && (
              <div data-testid="tab-content-overview" className="space-y-6">
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold mb-3">대회 소개</h2>
                  <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{hackathon.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {hackathon.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-3">팀 정책</h3>
                  <p className="text-text-secondary text-sm">솔로 참가: {hackathon.teamPolicy.solo ? '가능' : '불가'} · 최대 {hackathon.teamPolicy.maxMembers}명</p>
                </div>

                {/* J4: IDE integration dropdown */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-3">개발 시작하기</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleDownloadJSON}
                      className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-text-on-primary font-mono text-sm rounded-lg hover:bg-text-primary/90 transition-colors"
                    >
                      <Download size={16} /> JSON 다운로드
                    </button>

                    {/* IDE dropdown button group */}
                    <div className="relative" ref={ideDropdownRef}>
                      <button
                        onClick={() => setIdeDropdownOpen((v) => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-on-primary font-mono text-sm rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Terminal size={16} /> IDE에서 열기 <ChevronDown size={14} className={`transition-transform ${ideDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {ideDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                          {IDE_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.action}
                                onClick={() => handleIdeAction(opt.action)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-interactive-hover transition-colors text-left"
                              >
                                <Icon size={15} className="text-text-secondary shrink-0" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team */}
            {activeTab === 'team' && (
              <div data-testid="tab-content-team" className="space-y-4">
                {/* J6: Team policy info */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Users size={16} className="text-primary" /> 팀 참가 규칙</h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${hackathon.teamPolicy.solo ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                      솔로 참가: {hackathon.teamPolicy.solo ? '허용' : '불가'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                      최대 {hackathon.teamPolicy.maxMembers}명
                    </span>
                  </div>
                </div>

                {/* J6: My team section */}
                {isLoggedIn && myTeamsForHack.length > 0 && (
                  <div className="bg-primary-light/30 border border-primary/20 rounded-xl p-5">
                    <h3 className="font-bold mb-3 text-primary flex items-center gap-2"><Check size={16} /> 내 팀</h3>
                    <div className="space-y-2">
                      {myTeamsForHack.map((team) => (
                        <div key={team.id} className="bg-surface rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-text-primary text-sm">{team.name}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{team.members.length}/{team.maxMembers}명</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${team.recruitStatus === 'open' ? 'bg-success-light text-success' : 'bg-border text-text-secondary'}`}>
                            {team.recruitStatus === 'open' ? '모집중' : '마감'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* J6: Action buttons */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">참여 팀 ({hackTeams.length})</h2>
                  <div className="flex gap-2">
                    <Link
                      href={`/camp?hackathon=${slug}`}
                      className="text-sm px-3 py-1.5 bg-surface border border-border rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Users size={14} /> 팀 찾기
                    </Link>
                    <Link
                      href={`/teams/create?hackathon=${slug}`}
                      className="text-sm px-3 py-1.5 bg-primary text-text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      <Users size={14} /> 팀 만들기
                    </Link>
                  </div>
                </div>

                {hackTeams.length === 0 ? (
                  <div data-testid="empty-state" className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                    아직 등록된 팀이 없습니다. <Link href={`/teams/create?hackathon=${slug}`} className="text-primary hover:underline">팀을 만들어보세요!</Link>
                  </div>
                ) : hackTeams.map((team) => (
                  <div key={team.id} className="bg-surface border border-border rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-primary-light transition-colors">
                    <div>
                      <h3 className="font-semibold text-text-primary">{team.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">{team.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span><Users size={12} className="inline mr-1" />{team.members.length}/{team.maxMembers}명</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${team.recruitStatus === 'open' ? 'bg-success-light text-success' : 'bg-background text-text-secondary'}`}>
                          {team.recruitStatus === 'open' ? '모집중' : '마감'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Evaluation */}
            {activeTab === 'evaluation' && (
              <div data-testid="tab-content-evaluation" className="space-y-4">
                <h2 className="text-lg font-bold">평가 방식</h2>
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-4 ${badge.cls}`}>{badge.label}</span>
                  {hackathon.metrics && hackathon.metrics.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-sm mb-2">평가 메트릭</h3>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.metrics.map((m) => (
                          <span key={m} className="font-mono text-sm bg-primary-light text-primary px-3 py-1.5 rounded-lg">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hackathon.evaluationCriteria && hackathon.evaluationCriteria.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">평가 기준</h3>
                      <div className="space-y-3">
                        {hackathon.evaluationCriteria.map((c) => (
                          <div key={c.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{c.name}</span>
                              <span className="font-mono text-primary">{c.weight}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-2.5">
                              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${c.weight}%` }} />
                            </div>
                            <p className="text-xs text-text-secondary mt-1">{c.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prize */}
            {activeTab === 'prize' && (
              <div data-testid="tab-content-prize" className="space-y-4">
                <h2 className="text-lg font-bold">상금</h2>
                <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-border/50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-text-primary">순위</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-text-primary">상금</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hackathon.prizes.map((p) => (
                        <tr key={p.rank} className="border-t border-border">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {p.rank === 1 && <Trophy size={20} className="text-warning" />}
                              {p.rank === 2 && <Medal size={20} className="text-text-secondary" />}
                              {p.rank === 3 && <Award size={20} className="text-warning" />}
                              <span className="font-medium">{p.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-primary">{p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notice */}
            {activeTab === 'notice' && (
              <div data-testid="tab-content-notice" className="space-y-4">
                <h2 className="text-lg font-bold">안내</h2>
                {hackathon.notices.length === 0 ? (
                  <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">공지사항이 없습니다.</div>
                ) : (
                  hackathon.notices
                    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
                    .map((n) => (
                      <div key={n.id} className={`bg-surface border rounded-xl p-5 ${n.pinned ? 'border-primary/30 bg-primary-light/20' : 'border-border'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {n.pinned && <Pin size={14} className="text-primary" />}
                          <h3 className="font-semibold text-text-primary">{n.title}</h3>
                          <span className="ml-auto text-xs text-text-secondary">{n.createdAt}</span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{n.content}</p>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Schedule */}
            {activeTab === 'schedule' && (
              <div data-testid="tab-content-schedule" className="space-y-4">
                <h2 className="text-lg font-bold">일정</h2>
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <div className="space-y-0">
                    {hackathon.milestones.map((ms, idx) => {
                      const remaining = daysUntil(ms.date);
                      return (
                        <div key={ms.label} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            {ms.done ? (
                              <CheckCircle2 size={24} className="text-primary shrink-0" />
                            ) : (
                              <Circle size={24} className="text-border shrink-0" />
                            )}
                            {idx < hackathon.milestones.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[32px] ${ms.done ? 'bg-primary' : 'bg-border'}`} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className={`font-medium ${ms.done ? 'text-text-primary' : 'text-text-secondary'}`}>{ms.label}</p>
                            <p className="text-sm text-text-secondary">{ms.date}</p>
                            {!ms.done && remaining > 0 && (
                              <span className="inline-block mt-1 text-xs font-mono bg-primary-light text-primary px-2 py-0.5 rounded-full">
                                D-{remaining}
                              </span>
                            )}
                            {!ms.done && remaining <= 0 && remaining > -1 && (
                              <span className="inline-block mt-1 text-xs font-mono bg-error-light text-error px-2 py-0.5 rounded-full">오늘 마감</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            {activeTab === 'submit' && (
              <div data-testid="tab-content-submit" className="space-y-6">
                <h2 className="text-lg font-bold">제출</h2>

                {/* E4: Mini calendar */}
                <MiniCalendar startDate={hackathon.startDate} endDate={hackathon.endDate} />

                {hackathon.status !== 'active' ? (
                  <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                    {hackathon.status === 'ended' ? '제출 기간이 종료되었습니다.' : '대회가 아직 시작되지 않았습니다.'}
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6 space-y-4">
                    {(hackathon.type === 'quantitative' || hackathon.type === 'hybrid') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-text-primary block mb-1">파일명</label>
                          <input
                            type="text"
                            placeholder="submission.csv"
                            value={submitForm.fileName}
                            onChange={(e) => setSubmitForm({ ...submitForm, fileName: e.target.value })}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-primary block mb-1">파일 크기 (KB)</label>
                          <input
                            type="number"
                            placeholder="1024"
                            value={submitForm.fileSize}
                            onChange={(e) => setSubmitForm({ ...submitForm, fileSize: e.target.value })}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-text-primary block mb-1">
                        {hackathon.type === 'qualitative' ? '제출 내용 (설명 중심)' : '제출 내용'}
                      </label>
                      <textarea
                        data-testid="submission-content"
                        rows={hackathon.type === 'qualitative' ? 8 : 4}
                        placeholder={hackathon.type === 'qualitative' ? '아이디어와 구현 내용을 상세히 작성해주세요...' : '제출 내용을 입력하세요...'}
                        value={submitForm.content}
                        onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-primary block mb-1">메모 (버전 설명)</label>
                      <input
                        type="text"
                        placeholder="v1: 기본 모델"
                        value={submitForm.memo}
                        onChange={(e) => setSubmitForm({ ...submitForm, memo: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                      />
                    </div>
                    <button
                      data-testid="submit-button"
                      onClick={handleSubmit}
                      disabled={!submitForm.content.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={16} /> 제출하기
                    </button>
                  </div>
                )}

                {/* Submission History */}
                {hackSubs.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">제출 이력</h3>
                    <div className="space-y-2">
                      {[...hackSubs].reverse().map((s) => (
                        <div key={s.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm font-semibold text-primary">v{s.version}</span>
                            <span className="text-sm text-text-secondary ml-3">{s.memo || s.content.slice(0, 50)}</span>
                            <span className="text-xs text-text-secondary ml-3">{s.createdAt}</span>
                          </div>
                          {s.score !== undefined && (
                            <span className="font-mono font-bold text-primary">{s.score}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div data-testid="tab-content-leaderboard" className="space-y-4">
                <h2 className="text-lg font-bold">리더보드</h2>
                {leaderboard?.status === 'pending-review' && hackathon.type === 'qualitative' ? (
                  <div className="bg-surface border border-border rounded-xl p-8 text-center">
                    <Clock size={32} className="mx-auto text-text-secondary mb-3" />
                    <p className="text-text-secondary font-medium">심사 후 공개됩니다</p>
                    <p className="text-sm text-text-secondary mt-1">정성 평가 심사가 진행 중입니다.</p>
                  </div>
                ) : !leaderboard || leaderboard.entries.length === 0 ? (
                  <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">아직 리더보드 데이터가 없습니다.</div>
                ) : (
                  <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                    <table data-testid="leaderboard-table" className="w-full">
                      <thead className="bg-border/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold w-16">#</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold">팀</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold">점수</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold hidden sm:table-cell">제출</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold hidden sm:table-cell">최근 제출</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.entries.map((e) => {
                          const isMe = user && hackTeams.find((t) => t.id === e.teamId)?.members.some((m) => m.userId === user.id);
                          return (
                            <tr key={e.teamId} className={`border-t border-border ${isMe ? 'bg-primary-light/30' : ''}`}>
                              <td className="px-4 py-3">
                                <span className={`font-mono font-bold ${e.rank === 1 ? 'text-warning' : e.rank === 2 ? 'text-text-secondary' : e.rank === 3 ? 'text-warning' : 'text-text-secondary'}`}>
                                  {e.rank}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-text-primary">{e.teamName} {isMe && <span className="text-xs text-primary ml-1">(내 팀)</span>}</td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-primary">{e.score.toFixed(1)}</td>
                              <td className="px-4 py-3 text-right text-sm text-text-secondary hidden sm:table-cell">{e.submissionCount}회</td>
                              <td className="px-4 py-3 text-right text-sm text-text-secondary hidden sm:table-cell">{e.lastSubmittedAt.slice(0, 10)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

        {/* J2: Desktop right sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            {SidebarContent}
          </div>
        </aside>
      </div>
    </div>
  );
}
