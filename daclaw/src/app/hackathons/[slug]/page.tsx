'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Users, Calendar, Clock,
  Trophy, Medal, Award, FileText, MessageSquare, Send, Download, Copy, ExternalLink,
  Pin, Check, CheckCircle2, Circle, BarChart3, Star, Info, Upload, AlertCircle, FileDown, Eye, EyeOff,
  Building2, Terminal, Code, ChevronDown, ChevronLeft, ChevronRight, Bell,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  { id: 'notice', label: '공지사항', icon: MessageSquare },
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

const PIE_COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#F59E0B', '#EC4899'];

const IDE_OPTIONS = [
  { label: 'Cursor', icon: Terminal, action: 'cursor' },
  { label: 'VS Code', icon: Code, action: 'vscode' },
  { label: 'ChatGPT', icon: ExternalLink, action: 'chatgpt' },
  { label: 'Claude', icon: ExternalLink, action: 'claude' },
  { label: '프롬프트만 복사', icon: Copy, action: 'copy' },
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

// Multi-month calendar with navigation
function MiniCalendar({ startDate, endDate }: { startDate: string; endDate: string }) {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Current display month (default: month containing start date)
  const [displayYear, setDisplayYear] = useState(start.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(start.getMonth());

  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  const firstDay = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function cellClass(day: number | null): string {
    if (day === null) return '';
    const date = new Date(displayYear, displayMonth, day);
    const isStart = date.toDateString() === start.toDateString();
    const isEnd = date.toDateString() === end.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const inRange = date >= start && date <= end;

    if (isStart) return 'bg-primary text-white font-bold rounded-l-full';
    if (isEnd) return 'bg-error text-white font-bold rounded-r-full';
    if (isToday && inRange) return 'bg-warning text-white font-bold rounded-full';
    if (inRange) return 'bg-primary-light/50 text-primary';
    return 'text-text-secondary';
  }

  function prevMonth() {
    setDisplayMonth((m) => {
      if (m === 0) { setDisplayYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }
  function nextMonth() {
    setDisplayMonth((m) => {
      if (m === 11) { setDisplayYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-md hover:bg-interactive-hover cursor-pointer active:scale-95 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-sm text-text-primary">{displayYear}년 {displayMonth + 1}월</span>
        <button onClick={nextMonth} className="p-1 rounded-md hover:bg-interactive-hover cursor-pointer active:scale-95 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-text-secondary py-0.5">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={`text-xs py-0.5 flex items-center justify-center h-8 w-8 mx-auto ${cellClass(day)}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />시작</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error inline-block" />종료</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" />오늘</span>
        </div>
        <span className="text-xs text-text-secondary">{startDate} ~ {endDate}</span>
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
  const { user, isLoggedIn, openAuthModal } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [toast, setToast] = useState('');
  const [submitForm, setSubmitForm] = useState({ content: '', memo: '', report: '', fileName: '', fileSize: '' });
  const [ideDropdownOpen, setIdeDropdownOpen] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [parsedPreview, setParsedPreview] = useState<string[][]>([]);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'announcement' | 'rule' | 'update'>('all');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const ideDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // For hybrid: include report in memo
    if (hackathon.type === 'hybrid' && submitForm.report) {
      sub.memo = [submitForm.report, submitForm.memo].filter(Boolean).join(' | ');
    }
    addSubmission(sub);
    if (score !== undefined) updateLeaderboard(slug, teamId, teamName, score);
    setSubmitForm({ content: '', memo: '', report: '', fileName: '', fileSize: '' });
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

  function generateIdePrompt(): string {
    if (!hackathon) return '';
    const typeLabel = hackathon.type === 'quantitative' ? '정량 평가' : hackathon.type === 'qualitative' ? '정성 평가' : '혼합 평가';
    const lines = [
      `# 대회 컨텍스트: ${hackathon.title}`,
      '',
      '## 대회 개요',
      hackathon.description,
      `- 주최: ${hackathon.organizer}`,
      `- 유형: ${typeLabel}`,
      `- 기간: ${hackathon.startDate} ~ ${hackathon.endDate}`,
      `- 태그: ${hackathon.tags.map((t) => `#${t}`).join(' ')}`,
    ];
    if (hackathon.metrics?.length) {
      lines.push('', '## 평가 메트릭', ...hackathon.metrics.map((m) => `- ${m}`));
    }
    if (hackathon.evaluationCriteria?.length) {
      lines.push('', '## 평가 기준', ...hackathon.evaluationCriteria.map((c) => `- ${c.name} (${c.weight}%): ${c.description}`));
    }
    if (hackathon.submissionFormat) {
      const fmt = hackathon.submissionFormat;
      lines.push('', '## 제출 양식', `- 형식: ${fmt.type.toUpperCase()}`);
      if (fmt.columns) lines.push(`- 필수 컬럼: ${fmt.columns.join(', ')}`);
      if (fmt.maxRows) lines.push(`- 최대 행 수: ${fmt.maxRows.toLocaleString()}`);
      if (fmt.description) lines.push(`- ${fmt.description}`);
    }
    if (hackathon.rules?.length) {
      lines.push('', '## 참가 규칙', ...hackathon.rules.map((r) => `- ${r}`));
    }
    if (hackathon.prizes.length) {
      lines.push('', '## 상금', ...hackathon.prizes.map((p) => `- ${p.label}: ${p.amount}`));
    }
    lines.push('', '---');
    if (hackathon.type === 'quantitative') {
      lines.push('이 대회에 참가합니다. 위 평가 메트릭과 제출 양식을 분석하고, 베이스라인 모델 코드를 작성해주세요.');
    } else if (hackathon.type === 'qualitative') {
      lines.push('이 대회에 참가합니다. 위 평가 기준을 분석하고, 프로젝트 구조와 초기 코드를 생성해주세요.');
    } else {
      lines.push('이 대회에 참가합니다. 위 정량/정성 평가 기준을 모두 분석하고, 베이스라인 접근 전략을 제안해주세요.');
    }
    return lines.join('\n');
  }

  function handleIdeAction(action: string) {
    if (!hackathon) return;
    setIdeDropdownOpen(false);
    const prompt = generateIdePrompt();

    const openIde = () => {
      if (action === 'cursor') window.open('cursor://open', '_self');
      else if (action === 'vscode') window.open('vscode://', '_self');
      else if (action === 'chatgpt') window.open('https://chat.openai.com', '_blank');
      else if (action === 'claude') window.open('https://claude.ai', '_blank');
    };

    if (action === 'copy') {
      navigator.clipboard.writeText(prompt)
        .then(() => setToast('대회 컨텍스트가 클립보드에 복사되었습니다'))
        .catch(() => setToast('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.'));
      return;
    }

    // Copy prompt to clipboard, then open IDE
    navigator.clipboard.writeText(prompt).then(() => {
      setToast('대회 컨텍스트가 복사되었습니다. AI 패널에 붙여넣기 하세요.');
      openIde();
    }).catch(() => {
      setToast('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
      openIde();
    });
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

  // File upload handler for submission
  function handleFileUpload(file: File) {
    const fmt = hackathon?.submissionFormat;
    if (!fmt) return;
    const errors: string[] = [];
    if (fmt.maxFileSize && file.size > fmt.maxFileSize * 1024) {
      errors.push(`파일 크기 초과: ${Math.round(file.size / 1024)}KB / 최대 ${fmt.maxFileSize}KB`);
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (fmt.type === 'csv' && ext !== 'csv') errors.push('CSV 파일만 업로드 가능합니다.');
    if (fmt.type === 'json' && ext !== 'json') errors.push('JSON 파일만 업로드 가능합니다.');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (fmt.type === 'csv') {
        // RFC 4180-aware CSV parser: respects quoted fields with commas/newlines
        function parseCsvLine(line: string): string[] {
          const cells: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
              if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
              else if (ch === '"') { inQuotes = false; }
              else { current += ch; }
            } else {
              if (ch === '"') { inQuotes = true; }
              else if (ch === ',') { cells.push(current.trim()); current = ''; }
              else { current += ch; }
            }
          }
          cells.push(current.trim());
          return cells;
        }
        // Split rows respecting quoted newlines
        const rows: string[] = [];
        let buf = '';
        let q = false;
        for (const ch of text.trim()) {
          if (ch === '"') q = !q;
          if (ch === '\n' && !q) { rows.push(buf); buf = ''; }
          else { buf += ch; }
        }
        if (buf) rows.push(buf);

        const header = parseCsvLine(rows[0] || '');
        if (fmt.columns) {
          const missing = fmt.columns.filter((c) => !header.includes(c));
          if (missing.length > 0) errors.push(`필수 컬럼 누락: ${missing.join(', ')}`);
        }
        if (fmt.maxRows && rows.length - 1 > fmt.maxRows) {
          errors.push(`행 수 초과: ${rows.length - 1}행 / 최대 ${fmt.maxRows}행`);
        }
        const preview = rows.slice(0, 6).map((r) => parseCsvLine(r));
        setParsedPreview(preview);
      } else if (fmt.type === 'json') {
        try {
          JSON.parse(text);
        } catch {
          errors.push('유효하지 않은 JSON 형식입니다.');
        }
        setParsedPreview([]);
      }
      setFileErrors(errors);
      setSubmitForm((f) => ({ ...f, content: text, fileName: file.name, fileSize: String(Math.round(file.size / 1024)) }));
    };
    reader.readAsText(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleSampleDownload() {
    const fmt = hackathon?.submissionFormat;
    if (!fmt?.sampleContent) return;
    const ext = fmt.type === 'csv' ? 'csv' : fmt.type === 'json' ? 'json' : 'md';
    const blob = new Blob([fmt.sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sample.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }

  // Submission validation
  function getSubmitErrors(): string[] {
    const errs: string[] = [];
    const fmt = hackathon?.submissionFormat;
    if (!submitForm.content.trim()) {
      errs.push('제출 내용이 비어있습니다.');
      return errs;
    }
    if (fmt?.type === 'markdown') {
      if (fmt.minChars && submitForm.content.length < fmt.minChars) errs.push(`최소 ${fmt.minChars}자 이상 작성해주세요. (현재 ${submitForm.content.length}자)`);
      if (fmt.maxChars && submitForm.content.length > fmt.maxChars) errs.push(`최대 ${fmt.maxChars}자를 초과했습니다. (현재 ${submitForm.content.length}자)`);
    }
    return [...errs, ...fileErrors];
  }

  // Rank badge helper for 1/2/3위
  function RankBadge({ rank, size = 'md' }: { rank: number; size?: 'sm' | 'md' }) {
    const dim = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs';
    if (rank === 1) return <span className={`${dim} rounded-full bg-[#FFD700] text-white font-bold inline-flex items-center justify-center shrink-0`}>{rank}</span>;
    if (rank === 2) return <span className={`${dim} rounded-full bg-[#C0C0C0] text-white font-bold inline-flex items-center justify-center shrink-0`}>{rank}</span>;
    if (rank === 3) return <span className={`${dim} rounded-full bg-[#CD7F32] text-white font-bold inline-flex items-center justify-center shrink-0`}>{rank}</span>;
    return <span className={`${dim} rounded-full bg-border text-text-secondary font-bold inline-flex items-center justify-center shrink-0`}>{rank}</span>;
  }

  // Sidebar component (shared logic, rendered in two places)
  const SidebarContent = (
    <div className="space-y-4">
      {/* Prize card */}
      {/* Prize card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} className="text-warning" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">총 상금</span>
        </div>
        <p className="font-mono text-3xl font-bold text-text-primary mt-1">{formatPrizeTotal(hackathon.prizes)}</p>
        <div className="mt-3 space-y-1.5">
          {hackathon.prizes.map((p) => (
            <div key={p.rank} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-2">
                <RankBadge rank={p.rank} size="sm" />
                {p.label}
              </span>
              <span className="font-mono font-semibold text-primary">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer card — moved up for trust signal */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-text-secondary">주최</p>
          <p className="font-semibold text-text-primary text-sm">{hackathon.organizer}</p>
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
          className="w-full px-4 py-2.5 bg-primary text-text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Send size={16} /> 제출하기
        </button>
      )}
      {hackathon.status === 'upcoming' && (
        <button
          disabled
          className="w-full px-4 py-2.5 bg-border text-text-secondary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
        >
          <Bell size={16} /> 알림 받기
        </button>
      )}
      {hackathon.status === 'ended' && (
        <button
          onClick={handleSidebarCTA}
          className="w-full px-4 py-2.5 bg-surface border border-border text-text-primary rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Star size={16} /> 결과 보기
        </button>
      )}
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
      <button onClick={() => router.push('/hackathons')} className="flex items-center gap-1 text-text-secondary hover:text-primary mb-4 text-sm cursor-pointer active:scale-[0.98] transition-transform">
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
          onClick={() => { if (!isLoggedIn) { openAuthModal(); return; } toggleBookmark(slug); }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer active:scale-95"
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
              className="px-4 py-2 bg-primary text-text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Send size={14} /> 제출하기
            </button>
          )}
          {hackathon.status === 'ended' && (
            <button
              onClick={handleSidebarCTA}
              className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
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
                {/* Rules */}
                {hackathon.rules && hackathon.rules.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                    <h3 className="font-bold mb-3">참가 규칙</h3>
                    <ul className="space-y-2">
                      {hackathon.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Schedule summary */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-3">일정 요약</h3>
                  <div className="flex flex-wrap gap-3">
                    {hackathon.milestones.map((ms) => (
                      <div key={ms.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${ms.done ? 'bg-primary-light/30 text-primary' : 'bg-background text-text-secondary'}`}>
                        {ms.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        <span className="font-medium">{ms.label}</span>
                        <span className="text-xs opacity-70">{ms.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prize summary */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-3">상금</h3>
                  <div className="flex flex-wrap gap-3">
                    {hackathon.prizes.slice(0, 3).map((p) => (
                      <div key={p.rank} className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                        <RankBadge rank={p.rank} />
                        <div>
                          <p className="text-xs text-text-secondary">{p.label}</p>
                          <p className="font-mono font-bold text-primary">{p.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hackathon.prizeNote && (
                    <p className="text-xs text-text-secondary mt-3 bg-background rounded-lg px-3 py-2">{hackathon.prizeNote}</p>
                  )}
                </div>

                {/* Submission format + data description */}
                {hackathon.submissionFormat && (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Upload size={16} className="text-primary" /> 데이터 & 제출 양식
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">{hackathon.submissionFormat.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs font-semibold text-text-secondary mb-1">제출 형식</p>
                        <p className="font-mono text-sm text-text-primary">{hackathon.submissionFormat.type.toUpperCase()}</p>
                      </div>
                      {hackathon.submissionFormat.columns && (
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs font-semibold text-text-secondary mb-1">필수 컬럼</p>
                          <p className="font-mono text-sm text-text-primary">{hackathon.submissionFormat.columns.join(', ')}</p>
                        </div>
                      )}
                      {hackathon.submissionFormat.maxRows && (
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs font-semibold text-text-secondary mb-1">최대 행 수</p>
                          <p className="font-mono text-sm text-text-primary">{hackathon.submissionFormat.maxRows.toLocaleString()}행</p>
                        </div>
                      )}
                      {hackathon.submissionFormat.minChars && (
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs font-semibold text-text-secondary mb-1">글자 수</p>
                          <p className="font-mono text-sm text-text-primary">{hackathon.submissionFormat.minChars}~{hackathon.submissionFormat.maxChars}자</p>
                        </div>
                      )}
                      {hackathon.submissionFormat.maxFileSize && (
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs font-semibold text-text-secondary mb-1">최대 파일 크기</p>
                          <p className="font-mono text-sm text-text-primary">{(hackathon.submissionFormat.maxFileSize / 1024).toFixed(0)}MB</p>
                        </div>
                      )}
                    </div>
                    {hackathon.submissionFormat.sampleContent && (
                      <details className="mt-3">
                        <summary className="text-xs text-text-secondary cursor-pointer hover:text-primary select-none">샘플 데이터 미리보기</summary>
                        <pre className="mt-2 p-3 bg-background border border-border rounded-lg text-xs text-text-secondary overflow-x-auto font-mono whitespace-pre-wrap">{hackathon.submissionFormat.sampleContent}</pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Team policy */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-3">팀 정책</h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${hackathon.teamPolicy.solo ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                      솔로 참가: {hackathon.teamPolicy.solo ? '허용' : '불가'}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-light text-primary">
                      최대 {hackathon.teamPolicy.maxMembers}명
                    </span>
                  </div>
                </div>

                {/* FAQ */}
                {hackathon.faq && hackathon.faq.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                    <h3 className="font-bold mb-3">자주 묻는 질문</h3>
                    <div className="space-y-2">
                      {hackathon.faq.map((item, i) => (
                        <div key={i} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-interactive-hover transition-colors text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-primary font-bold">Q.</span>
                              {item.question}
                            </span>
                            <ChevronDown size={16} className={`text-text-secondary transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                          </button>
                          {openFaq === i && (
                            <div className="px-4 pb-3 text-sm text-text-secondary border-t border-border pt-3">
                              <span className="text-primary font-bold mr-1">A.</span>
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* J4: IDE integration dropdown */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <h3 className="font-bold mb-1">개발 시작하기</h3>
                  <p className="text-xs text-text-secondary mb-4">대회 컨텍스트를 AI 에이전트에게 전달하여 바로 작업을 시작하세요.</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                      <button
                        onClick={handleDownloadJSON}
                        className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-text-on-primary font-mono text-sm rounded-lg hover:bg-text-primary/90 transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        <Download size={16} /> JSON 다운로드
                        <Info size={14} className="text-white/60" />
                      </button>
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface border border-border rounded-lg shadow-lg p-3 text-xs text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                        대회 메타데이터 JSON 파일: 제목, 설명, 평가기준, 태그, 제출 양식 정보를 포함합니다.
                      </div>
                    </div>

                    {/* IDE dropdown button group */}
                    <div className="relative" ref={ideDropdownRef}>
                      <button
                        onClick={() => setIdeDropdownOpen((v) => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-on-primary font-mono text-sm rounded-lg hover:bg-primary/90 transition-colors cursor-pointer active:scale-[0.98]"
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
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-interactive-hover transition-colors text-left cursor-pointer"
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

                  {/* Prompt preview (collapsible) */}
                  <details className="group mt-4">
                    <summary className="text-xs text-text-secondary cursor-pointer hover:text-primary select-none flex items-center gap-1">
                      <ChevronRight size={12} className="transition-transform group-open:rotate-90" />
                      복사될 프롬프트 미리보기
                    </summary>
                    <pre className="mt-2 p-3 bg-background border border-border rounded-lg text-xs text-text-secondary overflow-x-auto max-h-48 whitespace-pre-wrap font-mono">
                      {generateIdePrompt()}
                    </pre>
                  </details>
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

                {/* Type badge + metrics */}
                <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-4 ${badge.cls}`}>{badge.label}</span>
                  {hackathon.metrics && hackathon.metrics.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">평가 메트릭</h3>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.metrics.map((m) => (
                          <span key={m} className="font-mono text-sm bg-primary-light text-primary px-3 py-1.5 rounded-lg">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pie chart + criteria cards */}
                {hackathon.evaluationCriteria && hackathon.evaluationCriteria.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-sm mb-4">평가 기준</h3>
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      {/* Donut chart */}
                      <div className="w-full lg:w-56 shrink-0">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={hackathon.evaluationCriteria.map((c) => ({ name: c.name, value: c.weight }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {hackathon.evaluationCriteria.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                          {hackathon.evaluationCriteria.map((c, idx) => (
                            <span key={c.name} className="flex items-center gap-1 text-xs text-text-secondary">
                              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Criteria detail cards */}
                      <div className="flex-1 space-y-3 w-full">
                        {hackathon.evaluationCriteria.map((c, idx) => (
                          <div key={c.name} className="border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                              <span className="font-semibold text-sm">{c.name}</span>
                              <span className="font-mono text-xs text-text-secondary ml-auto">{c.weight}%</span>
                            </div>
                            <p className="text-xs text-text-secondary mb-2">{c.description}</p>
                            {c.examples && c.examples.length > 0 && (
                              <div className="space-y-1">
                                {c.examples.map((ex, ei) => (
                                  <div key={ei} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                    <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                                    <span>{ex}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                            <div className="flex items-center gap-2.5">
                              <RankBadge rank={p.rank} />
                              <span className="font-medium">{p.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-primary">{p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hackathon.prizeNote && (
                  <div className="bg-background border border-border rounded-xl p-4 flex items-start gap-2">
                    <Info size={16} className="text-text-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-text-secondary">{hackathon.prizeNote}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notice */}
            {activeTab === 'notice' && (() => {
              const NOTICE_FILTERS = [
                { id: 'all' as const, label: '전체' },
                { id: 'announcement' as const, label: '공지' },
                { id: 'rule' as const, label: '규칙' },
                { id: 'update' as const, label: '업데이트' },
              ];
              const CATEGORY_BADGE: Record<string, string> = {
                announcement: 'bg-primary-light text-primary',
                rule: 'bg-warning-light text-warning',
                update: 'bg-info-light text-info',
              };
              const filtered = hackathon.notices
                .filter((n) => noticeFilter === 'all' || n.category === noticeFilter)
                .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
              return (
                <div data-testid="tab-content-notice" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">공지사항</h2>
                    <div className="flex gap-1">
                      {NOTICE_FILTERS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setNoticeFilter(f.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            noticeFilter === f.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-interactive-hover'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">공지사항이 없습니다.</div>
                  ) : (
                    filtered.map((n) => {
                      const isExpanded = expandedNotice === n.id;
                      return (
                        <div
                          key={n.id}
                          className={`bg-surface border rounded-xl overflow-hidden transition-colors ${n.pinned ? 'border-primary/30 bg-primary-light/20' : 'border-border'}`}
                        >
                          {/* Header — clickable */}
                          <button
                            onClick={() => setExpandedNotice(isExpanded ? null : n.id)}
                            className="w-full flex items-center gap-2 px-5 py-4 text-left cursor-pointer hover:bg-interactive-hover/50 transition-colors"
                          >
                            {n.pinned && <Pin size={14} className="text-primary shrink-0" />}
                            {n.category && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${CATEGORY_BADGE[n.category] || 'bg-border text-text-secondary'}`}>
                                {n.category === 'announcement' ? '공지' : n.category === 'rule' ? '규칙' : '업데이트'}
                              </span>
                            )}
                            <h3 className="font-semibold text-text-primary text-sm truncate">{n.title}</h3>
                            <span className="ml-auto text-xs text-text-secondary shrink-0">{n.createdAt}</span>
                            <ChevronDown size={14} className={`text-text-secondary shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="px-5 pb-4 border-t border-border pt-3">
                              <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                                <Building2 size={12} />
                                <span>작성자: {hackathon.organizer}</span>
                                <span>·</span>
                                <span>{n.createdAt}</span>
                              </div>
                              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{n.content}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}

            {/* Schedule */}
            {activeTab === 'schedule' && (
              <div data-testid="tab-content-schedule" className="space-y-4">
                <h2 className="text-lg font-bold">일정</h2>

                {/* Calendar view */}
                <MiniCalendar startDate={hackathon.startDate} endDate={hackathon.endDate} />

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

                {/* Mini calendar */}
                <MiniCalendar startDate={hackathon.startDate} endDate={hackathon.endDate} />

                {/* Submission Guide Card */}
                {hackathon.submissionFormat && (
                  <div className="bg-primary-light/20 border border-primary/20 rounded-xl p-5">
                    <h3 className="font-semibold text-sm text-primary flex items-center gap-2 mb-2">
                      <Info size={16} /> 제출 가이드
                    </h3>
                    <p className="text-sm text-text-secondary mb-3">{hackathon.submissionFormat.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="bg-surface px-2.5 py-1 rounded-md font-mono">
                        형식: {hackathon.submissionFormat.type.toUpperCase()}
                      </span>
                      {hackathon.submissionFormat.columns && (
                        <span className="bg-surface px-2.5 py-1 rounded-md font-mono">
                          필수 컬럼: {hackathon.submissionFormat.columns.join(', ')}
                        </span>
                      )}
                      {hackathon.submissionFormat.maxRows && (
                        <span className="bg-surface px-2.5 py-1 rounded-md font-mono">
                          최대 {hackathon.submissionFormat.maxRows.toLocaleString()}행
                        </span>
                      )}
                      {hackathon.submissionFormat.minChars && (
                        <span className="bg-surface px-2.5 py-1 rounded-md font-mono">
                          최소 {hackathon.submissionFormat.minChars}자
                        </span>
                      )}
                      {hackathon.submissionFormat.maxFileSize && (
                        <span className="bg-surface px-2.5 py-1 rounded-md font-mono">
                          최대 {hackathon.submissionFormat.maxFileSize}KB
                        </span>
                      )}
                    </div>
                    {hackathon.submissionFormat.sampleContent && (
                      <button
                        onClick={handleSampleDownload}
                        className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer active:scale-[0.98]"
                      >
                        <FileDown size={14} /> 샘플 파일 다운로드
                      </button>
                    )}
                  </div>
                )}

                {hackathon.status !== 'active' ? (
                  <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                    {hackathon.status === 'ended' ? '제출 기간이 종료되었습니다.' : '대회가 아직 시작되지 않았습니다.'}
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-xl shadow-sm p-6 space-y-4">

                    {/* File Upload (quantitative / hybrid) */}
                    {(hackathon.type === 'quantitative' || hackathon.type === 'hybrid') && (
                      <>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            dragOver ? 'border-primary bg-primary-light/20' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Upload size={32} className="mx-auto text-text-secondary mb-2" />
                          <p className="text-sm text-text-secondary">
                            {submitForm.fileName
                              ? <span className="text-primary font-medium">{submitForm.fileName} ({submitForm.fileSize}KB)</span>
                              : <>파일을 드래그하거나 <span className="text-primary font-medium">클릭하여 업로드</span></>
                            }
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {hackathon.submissionFormat?.type === 'json' ? 'JSON' : 'CSV'} 파일만 지원
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={hackathon.submissionFormat?.type === 'json' ? '.json' : '.csv'}
                            onChange={handleFileInput}
                            className="hidden"
                          />
                        </div>

                        {/* File Preview Table */}
                        {parsedPreview.length > 0 && (
                          <div className="overflow-x-auto">
                            <p className="text-xs font-medium text-text-secondary mb-2">미리보기 (처음 5행)</p>
                            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                              <thead className="bg-border/50">
                                <tr>
                                  {parsedPreview[0]?.map((h, i) => (
                                    <th key={i} className="px-3 py-1.5 text-left font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {parsedPreview.slice(1).map((row, ri) => (
                                  <tr key={ri} className="border-t border-border">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="px-3 py-1.5 text-text-secondary font-mono">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}

                    {/* Markdown Editor (qualitative) */}
                    {hackathon.type === 'qualitative' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-text-primary">제출 내용 (마크다운)</label>
                          <button
                            onClick={() => setShowMarkdownPreview((v) => !v)}
                            className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary cursor-pointer"
                          >
                            {showMarkdownPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showMarkdownPreview ? '편집' : '미리보기'}
                          </button>
                        </div>
                        {showMarkdownPreview ? (
                          <div className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm min-h-[200px] prose prose-sm max-w-none whitespace-pre-wrap">
                            {submitForm.content || <span className="text-text-secondary">내용이 없습니다</span>}
                          </div>
                        ) : (
                          <textarea
                            data-testid="submission-content"
                            rows={10}
                            placeholder={hackathon.submissionFormat?.sampleContent || '마크다운 형식으로 작성해주세요...'}
                            value={submitForm.content}
                            onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow resize-none"
                          />
                        )}
                        {/* Char counter */}
                        {hackathon.submissionFormat && (
                          <div className="flex justify-end mt-1 text-xs">
                            <span className={
                              (hackathon.submissionFormat.minChars && submitForm.content.length < hackathon.submissionFormat.minChars)
                                ? 'text-error'
                                : (hackathon.submissionFormat.maxChars && submitForm.content.length > hackathon.submissionFormat.maxChars)
                                  ? 'text-error'
                                  : 'text-text-secondary'
                            }>
                              {submitForm.content.length}자
                              {hackathon.submissionFormat.minChars && ` / 최소 ${hackathon.submissionFormat.minChars}`}
                              {hackathon.submissionFormat.maxChars && ` / 최대 ${hackathon.submissionFormat.maxChars}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hybrid: also show text area for report */}
                    {hackathon.type === 'hybrid' && (
                      <div>
                        <label className="text-sm font-medium text-text-primary block mb-1">분석 보고서</label>
                        <textarea
                          data-testid="submission-content-report"
                          rows={6}
                          placeholder="분석 과정과 인사이트를 작성해주세요..."
                          value={submitForm.report}
                          onChange={(e) => setSubmitForm({ ...submitForm, report: e.target.value })}
                          className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow resize-none"
                        />
                      </div>
                    )}

                    {/* Memo */}
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

                    {/* Validation Errors */}
                    {getSubmitErrors().length > 0 && submitForm.content.length > 0 && (
                      <div className="bg-error-light/50 border border-error/20 rounded-lg p-3 space-y-1">
                        {getSubmitErrors().map((err, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-error">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      data-testid="submit-button"
                      onClick={handleSubmit}
                      disabled={!submitForm.content.trim() || getSubmitErrors().length > 0}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
                          <div className="min-w-0">
                            <span className="font-mono text-sm font-semibold text-primary">v{s.version}</span>
                            <span className="text-sm text-text-secondary ml-3">{s.memo || s.content.slice(0, 50)}</span>
                            <span className="text-xs text-text-secondary ml-3">{s.createdAt}</span>
                          </div>
                          {s.score !== undefined && (
                            <span className="font-mono font-bold text-primary shrink-0 ml-2">{s.score}</span>
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
                                <RankBadge rank={e.rank} size="sm" />
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
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 scrollbar-hide">
            {SidebarContent}
          </div>
        </aside>
      </div>
    </div>
  );
}
