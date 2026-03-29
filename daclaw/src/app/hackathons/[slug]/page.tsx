'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Users, Calendar, Clock,
  Trophy, Medal, Award, FileText, MessageSquare, Send, Download, Copy, ExternalLink,
  Pin, Check, CheckCircle2, Circle, AlertCircle, BarChart3, Star,
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

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  quantitative: { label: '정량 평가', cls: 'bg-type-quantitative/90 text-text-on-primary' },
  qualitative: { label: '정성 평가', cls: 'bg-type-qualitative/90 text-text-on-primary' },
  hybrid: { label: '혼합 평가', cls: 'bg-type-hybrid/90 text-text-on-primary' },
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
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

  const hackathon = getBySlug(slug);
  const hackTeams = teams.filter((t) => t.hackathonSlugs.includes(slug));
  const allHackSubs = submissions.filter((s) => s.hackathonSlug === slug);
  const myTeamIds = new Set(
    teams.filter((t) => t.hackathonSlugs.includes(slug) && t.members.some((m) => m.userId === user?.id)).map((t) => t.id)
  );
  const hackSubs = allHackSubs.filter((s) => myTeamIds.has(s.teamId) || s.teamId === `solo-${user?.id}`);
  const leaderboard = getLeaderboard(slug);
  const bookmarked = isBookmarked(slug);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!hackathon) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-text-secondary mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">해커톤을 찾을 수 없습니다</h1>
        <button onClick={() => router.push('/hackathons')} className="text-primary hover:underline">목록으로 돌아가기</button>
      </div>
    );
  }

  const badge = TYPE_BADGE[hackathon.type];

  function handleSubmit() {
    if (!submitForm.content.trim() || !hackathon || !isLoggedIn || !user) return;
    const myTeam = hackTeams.find((t) => t.members.some((m) => m.userId === user.id));
    if (!hackathon.teamPolicy.solo && !myTeam) return;
    const teamId = myTeam?.id ?? `solo-${user.id}`;
    const teamName = myTeam?.name ?? user?.nickname ?? '익명';
    const version = hackSubs.filter((s) => s.teamId === teamId).length + 1;
    const score = hackathon.type !== 'qualitative' ? Math.round((60 + Math.random() * 35) * 10) / 10 : undefined;
    const sub = {
      id: `sub-${Date.now()}`,
      hackathonSlug: slug,
      teamId,
      version,
      content: submitForm.content,
      memo: submitForm.memo,
      fileName: submitForm.fileName || undefined,
      fileSize: submitForm.fileSize ? Number(submitForm.fileSize) : undefined,
      score,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addSubmission(sub);
    if (score !== undefined) updateLeaderboard(slug, teamId, teamName, score);
    setSubmitForm({ content: '', memo: '', fileName: '', fileSize: '' });
    setToast('제출이 완료되었습니다!');
  }

  function handleCopyJSON() {
    if (!hackathon) return;
    const data = { title: hackathon.title, type: hackathon.type, description: hackathon.description, tags: hackathon.tags, dates: { start: hackathon.startDate, end: hackathon.endDate }, metrics: hackathon.metrics, evaluationCriteria: hackathon.evaluationCriteria };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setToast('JSON이 클립보드에 복사되었습니다');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast */}
      {toast && (
        <div data-testid="toast-message" className="fixed top-20 right-4 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Back + Header */}
      <button onClick={() => router.push('/hackathons')} className="flex items-center gap-1 text-text-secondary hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} /> 목록으로
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-56">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40"
          style={hackathon.thumbnailUrl ? { backgroundImage: `url(${hackathon.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
            {hackathon.status === 'active' && (
              <span className="bg-success text-text-on-primary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> 진행중
              </span>
            )}
            {hackathon.status === 'upcoming' && <span className="bg-warning text-text-on-primary px-2 py-0.5 rounded-full text-xs font-medium">예정</span>}
            {hackathon.status === 'ended' && <span className="bg-text-secondary text-text-on-primary px-2 py-0.5 rounded-full text-xs font-medium">종료</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{hackathon.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Users size={14} /> {hackathon.participantCount}명</span>
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

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-6 border-b border-border pb-px scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-primary hover:border-primary-light'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div data-testid="tab-content-overview" className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3">대회 소개</h2>
              <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{hackathon.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {hackathon.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="font-bold mb-3">팀 정책</h3>
              <p className="text-text-secondary text-sm">솔로 참가: {hackathon.teamPolicy.solo ? '가능' : '불가'} · 최대 {hackathon.teamPolicy.maxMembers}명</p>
            </div>
            {/* Agentic Downloads */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="font-bold mb-3">개발 시작하기</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleDownloadJSON} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-white font-mono text-sm rounded-lg hover:bg-text-primary/90 transition-colors">
                  <Download size={16} /> JSON 다운로드
                </button>
                <button onClick={handleCopyJSON} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-white font-mono text-sm rounded-lg hover:bg-text-primary/90 transition-colors">
                  <Copy size={16} /> 코드 복사
                </button>
                <a href={`cursor://open?url=${encodeURIComponent(hackathon.title)}`} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-white font-mono text-sm rounded-lg hover:bg-text-primary/90 transition-colors">
                  <ExternalLink size={16} /> Cursor에서 열기
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === 'team' && (
          <div data-testid="tab-content-team" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">참여 팀 ({hackTeams.length})</h2>
              <Link href="/camp" className="text-sm text-primary hover:underline flex items-center gap-1">팀 찾기 <ArrowLeft size={14} className="rotate-180" /></Link>
            </div>
            {hackTeams.length === 0 ? (
              <div data-testid="empty-state" className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                아직 등록된 팀이 없습니다. <Link href="/camp" className="text-primary hover:underline">팀을 만들어보세요!</Link>
              </div>
            ) : hackTeams.map((team) => (
              <div key={team.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary-light transition-colors">
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
            <div className="bg-surface border border-border rounded-xl p-6">
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
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
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
            <div className="bg-surface border border-border rounded-xl p-6">
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
            {hackathon.status !== 'active' ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                {hackathon.status === 'ended' ? '제출 기간이 종료되었습니다.' : '대회가 아직 시작되지 않았습니다.'}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
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
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
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
    </div>
  );
}
