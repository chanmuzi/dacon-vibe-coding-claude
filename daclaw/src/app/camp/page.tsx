'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTeamStore } from '@/store/team';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import { useMessageStore } from '@/store/message';
import {
  Users, Plus, Sparkles, Send, X, Filter, ChevronDown, UserPlus, CheckCircle2, Check, Loader2,
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import type { Team, Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  developer: '개발자',
  designer: '디자이너',
  planner: '기획자',
  'data-scientist': '데이터 사이언티스트',
};

function calcMatchRate(team: Team, userRole: Role | undefined, userStack: string[], hackathonTags: string[]): number {
  const roleMatch = userRole && team.recruitRoles.includes(userRole) ? 40 : 0;
  const tagOverlap = userStack.filter((s) => hackathonTags.some((t) => t.toLowerCase().includes(s.toLowerCase()))).length;
  const tagMatch = hackathonTags.length > 0 ? (tagOverlap / hackathonTags.length) * 30 : 15;
  const statusBonus = team.recruitStatus === 'open' ? 10 : 0;
  return Math.min(Math.round(roleMatch + tagMatch + 20 + statusBonus), 100);
}

function getMatchReason(rate: number): { label: string; className: string } {
  if (rate >= 70) return { label: '기술스택 일치도 높음', className: 'text-primary' };
  if (rate >= 50) return { label: '역할 매칭', className: 'text-info' };
  return { label: '탐색 추천', className: 'text-text-secondary' };
}

const APPLY_ROLES: Role[] = ['developer', 'designer', 'planner', 'data-scientist'];

interface ApplyForm {
  intro: string;
  positions: Role[];
  techStack: string;
  portfolio: string;
}

function buildDmContent(form: ApplyForm): string {
  const positions = form.positions.map((r) => ROLE_LABELS[r]).join(', ') || '미정';
  const parts = [
    `[자기소개]\n${form.intro}`,
    `[가능 포지션] ${positions}`,
  ];
  if (form.techStack.trim()) parts.push(`[기술스택] ${form.techStack}`);
  if (form.portfolio.trim()) parts.push(`[포트폴리오] ${form.portfolio}`);
  return parts.join('\n\n');
}

export default function CampPage() {
  const { teams, addTeam } = useTeamStore();
  const { hackathons } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal } = useUserStore();
  const { addMessage } = useMessageStore();
  const searchParams = useSearchParams();

  const [hackFilter, setHackFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [applyTeam, setApplyTeam] = useState<Team | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyForm>({ intro: '', positions: [], techStack: '', portfolio: '' });
  const [toast, setToast] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '', hackathonSlug: '', roles: [] as Role[], maxMembers: 4 });
  const [recLoading, setRecLoading] = useState(false);
  const [recReady, setRecReady] = useState(false);

  // G11: Auto-filter from URL param ?hackathon=slug
  useEffect(() => {
    const hackathonParam = searchParams.get('hackathon');
    if (hackathonParam) {
      setHackFilter(hackathonParam);
    }
  }, [searchParams]);

  // G7: Brief loading animation when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      setRecReady(false);
      setRecLoading(true);
      const t = setTimeout(() => {
        setRecLoading(false);
        setRecReady(true);
      }, 500);
      return () => clearTimeout(t);
    } else {
      setRecLoading(false);
      setRecReady(false);
    }
  }, [isLoggedIn]);

  const filtered = useMemo(() => {
    let result = teams;
    if (hackFilter !== 'all') result = result.filter((t) => t.hackathonSlugs.includes(hackFilter));
    if (roleFilter !== 'all') result = result.filter((t) => t.recruitRoles.includes(roleFilter));
    return result;
  }, [teams, hackFilter, roleFilter]);

  const recommendations = useMemo(() => {
    const openTeams = teams.filter((t) => t.recruitStatus === 'open');
    return openTeams.map((t) => {
      const hack = hackathons.find((h) => t.hackathonSlugs.includes(h.slug));
      const rate = isLoggedIn && user
        ? calcMatchRate(t, user.role, user.techStack, hack?.tags ?? [])
        : Math.round(50 + Math.random() * 30);
      return { team: t, rate, hackTitle: hack?.title ?? '' };
    }).sort((a, b) => b.rate - a.rate).slice(0, 5);
  }, [teams, hackathons, user, isLoggedIn]);

  function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.hackathonSlug || !isLoggedIn || !user) return;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: createForm.name,
      description: createForm.description,
      hackathonSlugs: [createForm.hackathonSlug],
      members: [{ userId: user.id, nickname: user.nickname, role: user.role }],
      maxMembers: createForm.maxMembers,
      recruitRoles: createForm.roles,
      recruitStatus: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addTeam(newTeam);
    setCreateForm({ name: '', description: '', hackathonSlug: '', roles: [], maxMembers: 4 });
    setShowCreateForm(false);
    showToast('팀이 생성되었습니다!');
  }

  function handleSendDM() {
    if (!applyForm.intro.trim() || !applyTeam || !isLoggedIn || !user) return;
    const leader = applyTeam.members[0];
    if (!leader) return;
    addMessage({
      id: `msg-${Date.now()}`,
      from: user?.id ?? 'anonymous',
      to: leader?.userId ?? '',
      content: buildDmContent(applyForm),
      type: 'team-request',
      teamId: applyTeam.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    setApplyForm({ intro: '', positions: [], techStack: '', portfolio: '' });
    setApplyTeam(null);
    showToast('참가 신청이 전송되었습니다!');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleRole(role: Role) {
    setCreateForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }));
  }

  function toggleApplyPosition(role: Role) {
    setApplyForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(role)
        ? prev.positions.filter((r) => r !== role)
        : [...prev.positions, role],
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div data-testid="dm-success-toast" className="fixed top-20 right-4 z-50 bg-primary text-text-on-primary px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">팀원 모집</h1>
              <p className="text-text-secondary text-sm mt-1">총 {filtered.length}개의 팀</p>
            </div>
            <button
              data-testid="create-team-button"
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} /> 팀 만들기
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <select
                value={hackFilter}
                onChange={(e) => setHackFilter(e.target.value)}
                className="pl-8 pr-8 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-primary-light focus:border-primary appearance-none"
              >
                <option value="all">모든 해커톤</option>
                {hackathons.map((h) => (
                  <option key={h.slug} value={h.slug}>{h.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
            <div className="flex gap-1">
              {(['all', 'developer', 'designer', 'planner', 'data-scientist'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    roleFilter === r ? 'bg-primary text-text-on-primary' : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                  }`}
                >
                  {r === 'all' ? '전체' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Team Cards */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
                조건에 맞는 팀이 없습니다.
              </div>
            ) : filtered.map((team) => {
              const hack = hackathons.find((h) => team.hackathonSlugs.includes(h.slug));
              const isOpen = team.recruitStatus === 'open';
              return (
                // G10: Entire card is a link to /teams/[id]
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  data-testid="team-card"
                  className="block bg-surface border border-border rounded-xl p-5 hover:border-primary-light hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-text-primary">{team.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOpen ? 'bg-success-light text-success' : 'bg-background text-text-secondary'}`}>
                          {isOpen ? '모집중' : '마감'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">{team.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span className="bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium">{hack?.title ?? team.hackathonSlugs[0] ?? '미정'}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {team.members.length}/{team.maxMembers}명</span>
                        {/* G3: Flexible role recruitment — suggestive framing */}
                        {team.recruitRoles.length > 0 && (
                          <span>선호 역할: {team.recruitRoles.map((r) => ROLE_LABELS[r]).join(', ')}</span>
                        )}
                      </div>
                      {/* G3: "다른 역할도 환영합니다" hint */}
                      {team.recruitRoles.length > 0 && (
                        <p className="text-xs text-text-secondary mt-1">다른 역할도 환영합니다</p>
                      )}
                      {/* G8: Avatar with tooltip */}
                      <div className="flex gap-1 mt-2">
                        {team.members.map((m) => (
                          <span key={m.userId} title={`${m.nickname} (${ROLE_LABELS[m.role]})`}>
                            <UserAvatar role={m.role} size="sm" />
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* G9: Open = primary apply button; Closed = disabled button */}
                    {isOpen ? (
                      <button
                        data-testid="team-apply-button"
                        onClick={(e) => { e.preventDefault(); setApplyTeam(team); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-text-on-primary text-sm rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <UserPlus size={14} /> 참가 신청
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 bg-background text-text-secondary text-sm rounded-lg shrink-0 cursor-not-allowed"
                      >
                        모집 마감
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Recommendation Panel */}
        <div className="lg:w-80 shrink-0">
          <div data-testid="ai-recommendation-panel" className="bg-surface border border-primary/20 rounded-xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-primary" />
              <h2 className="font-bold text-text-primary">AI 추천 팀</h2>
            </div>

            {/* G6: Not logged in → CTA card */}
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Sparkles className="mx-auto mb-2 text-primary" size={28} />
                <p className="font-semibold mb-1 text-text-primary">로그인 후 추천 받기</p>
                <p className="text-xs text-text-secondary mb-3">맞춤 팀 추천을 받아보세요</p>
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  로그인
                </button>
              </div>
            ) : recLoading ? (
              /* G7: Loading animation */
              <div className="flex flex-col items-center py-6 gap-2 text-text-secondary">
                <Loader2 size={22} className="animate-spin text-primary" />
                <p className="text-sm">매칭 분석 중...</p>
              </div>
            ) : (
              /* G7: Recommendations with match reason */
              <div className="space-y-3">
                {recommendations.map(({ team, rate, hackTitle }) => {
                  const reason = getMatchReason(rate);
                  return (
                    <div key={team.id} className="border border-border rounded-lg p-3 hover:border-primary-light transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-text-primary">{team.name}</span>
                        <span data-testid="match-rate" className="font-mono text-sm font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> {rate}%
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mb-1">{hackTitle}</p>
                      <p className={`text-xs mb-2 ${reason.className}`}>{reason.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {team.recruitRoles.map((r) => (
                          <span key={r} className="text-xs bg-primary-light/60 text-primary px-1.5 py-0.5 rounded">
                            {user?.role === r && <Check size={12} className="inline" />} {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">팀 만들기</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-1 rounded-lg hover:bg-background"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">팀 이름</label>
                <input
                  data-testid="team-name-input"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="팀 이름을 입력하세요"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">팀 소개</label>
                <textarea
                  data-testid="team-description-input"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="팀 소개를 작성하세요"
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">해커톤</label>
                <select
                  value={createForm.hackathonSlug}
                  onChange={(e) => setCreateForm({ ...createForm, hackathonSlug: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                  required
                >
                  <option value="">선택하세요</option>
                  {hackathons.filter((h) => h.status !== 'ended').map((h) => (
                    <option key={h.slug} value={h.slug}>{h.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">모집 역할</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        createForm.roles.includes(r) ? 'bg-primary text-text-on-primary' : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">최대 인원</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: Number(e.target.value) })}
                  className="w-24 bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
              <button
                data-testid="team-submit-button"
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                팀 생성
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal — G8-1: Rich form */}
      {applyTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">참가 신청 — {applyTeam.name}</h2>
              <button onClick={() => setApplyTeam(null)} className="p-1 rounded-lg hover:bg-background"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* 자기소개 */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  자기소개 <span className="text-error text-xs">*</span>
                </label>
                <textarea
                  data-testid="dm-message-input"
                  value={applyForm.intro}
                  onChange={(e) => setApplyForm({ ...applyForm, intro: e.target.value })}
                  placeholder="자기소개와 참가 동기를 작성해주세요..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                />
              </div>

              {/* 가능 포지션 */}
              <div>
                <label className="text-sm font-medium block mb-1">가능 포지션</label>
                <div className="flex flex-wrap gap-2">
                  {APPLY_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleApplyPosition(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        applyForm.positions.includes(r)
                          ? 'bg-primary text-text-on-primary'
                          : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 기술스택 */}
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

              {/* 포트폴리오 */}
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
                data-testid="dm-send-button"
                onClick={handleSendDM}
                disabled={!applyForm.intro.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} /> 신청 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
