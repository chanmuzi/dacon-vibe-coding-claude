'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTeamStore } from '@/store/team';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import { useMessageStore } from '@/store/message';
import {
  Users, Plus, Sparkles, Check, Loader2, UserPlus, CheckCircle2,
} from 'lucide-react';
import Modal from '@/components/Modal';
import UserAvatar from '@/components/UserAvatar';
import CustomSelect from '@/components/CustomSelect';
import ApplyFormModal from '@/components/ApplyFormModal';
import { ROLE_LABELS } from '@/lib/constants';
import type { Team, Role } from '@/types';

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

function AiRecCard({ rec, teams: allTeams, userRole }: { rec: { teamId: string; teamName: string; matchScore: number; reason: string }; teams: Team[]; userRole?: string }) {
  const team = allTeams.find((t) => t.id === rec.teamId);
  const cardStyle = rec.matchScore >= 80
    ? 'border-primary bg-primary-light/10'
    : rec.matchScore >= 60
      ? 'border-info/40 bg-info-light/5'
      : 'border-border';
  const badgeClass = rec.matchScore >= 80
    ? 'bg-primary text-white'
    : rec.matchScore >= 60
      ? 'bg-info text-white'
      : 'bg-primary-light text-primary';
  return (
    <a
      href={team ? `/teams/${team.id}` : '#'}
      className={`block border rounded-lg p-3 hover:shadow-md transition-all group cursor-pointer ${cardStyle}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">{rec.teamName}</span>
        <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeClass}`}>
          <Sparkles size={10} /> {rec.matchScore}%
        </span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{rec.reason}</p>
      {team && (
        <div className="flex flex-wrap gap-1 mt-2">
          {team.recruitRoles.map((r) => (
            <span key={r} className="text-xs bg-primary-light/60 text-primary px-1.5 py-0.5 rounded">
              {userRole === r && <Check size={12} className="inline" />} {ROLE_LABELS[r]}
            </span>
          ))}
        </div>
      )}
    </a>
  );
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
  const [toast, setToast] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '', hackathonSlug: '', roles: [] as Role[], maxMembers: 4 });
  const [recLoading, setRecLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<{ teamId: string; teamName: string; matchScore: number; reason: string }[] | null>(null);
  const [aiError, setAiError] = useState(false);
  const [recStep, setRecStep] = useState(0);
  const [showRecModal, setShowRecModal] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [, setCooldownTick] = useState(0);

  // G11: Auto-filter from URL param ?hackathon=slug (React 19 prop-change pattern)
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  if (searchParams !== prevSearchParams) {
    setPrevSearchParams(searchParams);
    const hackathonParam = searchParams.get('hackathon');
    if (hackathonParam) {
      setHackFilter(hackathonParam);
    }
  }

  // Cleanup on logout (React 19 prop-change pattern)
  const [prevLoggedIn, setPrevLoggedIn] = useState(isLoggedIn);
  if (isLoggedIn !== prevLoggedIn) {
    setPrevLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      setRecLoading(false);
      setAiRecs(null);
      setShowRecModal(false);
    }
  }

  // localStorage persistence: load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daclaw-ai-recs');
      if (saved) setAiRecs(JSON.parse(saved));
    } catch { /* ignore parse errors */ }
  }, []);

  // localStorage persistence: save when aiRecs changes
  useEffect(() => {
    if (aiRecs) {
      localStorage.setItem('daclaw-ai-recs', JSON.stringify(aiRecs));
    } else {
      localStorage.removeItem('daclaw-ai-recs');
    }
  }, [aiRecs]);

  // localStorage cleanup on logout
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem('daclaw-ai-recs');
      localStorage.removeItem('daclaw-ai-rec-cooldown');
      setCooldownEnd(0);
    }
  }, [isLoggedIn]);

  // Cooldown: load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daclaw-ai-rec-cooldown');
      if (saved) {
        const end = Number(saved);
        if (end > Date.now()) {
          setCooldownEnd(end);
        } else {
          localStorage.removeItem('daclaw-ai-rec-cooldown');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Cooldown: tick every minute to update remaining time display
  useEffect(() => {
    if (cooldownEnd <= Date.now()) return;
    const interval = setInterval(() => {
      if (cooldownEnd <= Date.now()) {
        setCooldownEnd(0);
        localStorage.removeItem('daclaw-ai-rec-cooldown');
      } else {
        // Force re-render so remaining minutes recalculates
        setCooldownTick((t) => t + 1);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  // Step-based loading progress messages
  useEffect(() => {
    if (!recLoading) {
      setRecStep(0);
      return;
    }
    const t1 = setTimeout(() => setRecStep(1), 1500);
    const t2 = setTimeout(() => setRecStep(2), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [recLoading]);

  const filtered = useMemo(() => {
    let result = teams;
    if (hackFilter !== 'all') result = result.filter((t) => t.hackathonSlugs?.includes(hackFilter));
    if (roleFilter !== 'all') result = result.filter((t) => t.recruitRoles.includes(roleFilter));
    return result;
  }, [teams, hackFilter, roleFilter]);

  const recommendations = useMemo(() => {
    const openTeams = teams.filter((t) => t.recruitStatus === 'open');
    return openTeams.map((t) => {
      const hack = hackathons.find((h) => t.hackathonSlugs?.includes(h.slug));
      const rate = isLoggedIn && user
        ? calcMatchRate(t, user.role, user.techStack, hack?.tags ?? [])
        : 50 + (t.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 30);
      return { team: t, rate, hackTitle: hack?.title ?? '' };
    }).sort((a, b) => b.rate - a.rate).slice(0, 5);
  }, [teams, hackathons, user, isLoggedIn]);

  function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.hackathonSlug || !isLoggedIn || !user) return;
    const newTeam: Team = {
      id: `team-${crypto.randomUUID()}`,
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

  const REC_STEP_MESSAGES = ['프로필 분석 중...', '팀 매칭 중...', '결과 정리 중...'];

  function handleAiRecommend() {
    if (cooldownEnd > Date.now()) return;
    setRecLoading(true);
    setAiError(false);
    const startTime = Date.now();
    const openTeams = teams.filter((t) => t.recruitStatus === 'open');
    const teamsPayload = openTeams.map((t) => {
      const hack = hackathons.find((h) => t.hackathonSlugs?.includes(h.slug));
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        recruitRoles: t.recruitRoles.map((r) => ROLE_LABELS[r]),
        hackathonTitle: hack?.title ?? '미정',
        techStack: t.techStack ?? [],
        members: t.members.length,
        maxMembers: t.maxMembers,
      };
    });

    let resultRecs: typeof aiRecs = null;
    let hasError = false;

    fetch('/api/recommend-teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: { role: user?.role, techStack: user?.techStack, interests: user?.interests, grade: user?.grade },
        teams: teamsPayload,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          resultRecs = recommendations.slice(0, 3).map(({ team, rate }) => ({
            teamId: team.id,
            teamName: team.name,
            matchScore: rate,
            reason: getMatchReason(rate).label,
          }));
          return;
        }
        const data = await res.json();
        resultRecs = data.recommendations?.slice(0, 3) ?? [];
      })
      .catch(() => { hasError = true; })
      .finally(() => {
        // Ensure progress UI shows for at least 3.5s
        const elapsed = Date.now() - startTime;
        const minDelay = 3500;
        setTimeout(() => {
          if (hasError) {
            setAiError(true);
          } else {
            setAiRecs(resultRecs);
          }
          setRecLoading(false);
          const cooldownTime = Date.now() + 10 * 60 * 1000;
          setCooldownEnd(cooldownTime);
          localStorage.setItem('daclaw-ai-rec-cooldown', String(cooldownTime));
        }, Math.max(0, minDelay - elapsed));
      });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <Plus size={14} /> 팀 만들기
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <CustomSelect
              value={hackFilter}
              onChange={setHackFilter}
              options={[
                { value: 'all', label: '모든 해커톤' },
                ...hackathons.map((h) => ({ value: h.slug, label: h.title })),
              ]}
            />
            <div className="flex gap-1">
              {(['all', 'developer', 'designer', 'planner', 'data-scientist'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
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
              const hack = hackathons.find((h) => team.hackathonSlugs?.includes(h.slug));
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
                        <span className="bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium">{hack?.title ?? team.hackathonSlugs?.[0] ?? '미정'}</span>
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-text-on-primary text-sm rounded-lg hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shrink-0"
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

            {/* Not logged in → CTA */}
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Sparkles className="mx-auto mb-2 text-primary" size={28} />
                <p className="font-semibold mb-1 text-text-primary">로그인 후 추천 받기</p>
                <p className="text-xs text-text-secondary mb-3">맞춤 팀 추천을 받아보세요</p>
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  로그인
                </button>
              </div>
            ) : aiRecs ? (
              /* AI recommendations result — shown in sidebar */
              <div className="space-y-3">
                {aiRecs.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-4">매칭되는 팀이 없습니다.</p>
                ) : (
                  aiRecs.map((rec) => (
                    <AiRecCard key={rec.teamId} rec={rec} teams={teams} userRole={user?.role} />
                  ))
                )}
                {(() => {
                  const isCooldown = cooldownEnd > Date.now();
                  const remainMin = isCooldown ? Math.ceil((cooldownEnd - Date.now()) / 60_000) : 0;
                  return (
                    <button
                      onClick={() => { if (!isCooldown) { setAiRecs(null); setAiError(false); } }}
                      disabled={isCooldown}
                      className={`w-full text-xs mt-1 text-center transition-colors ${
                        isCooldown
                          ? 'text-text-secondary/50 cursor-not-allowed'
                          : 'text-text-secondary hover:text-primary cursor-pointer'
                      }`}
                    >
                      {isCooldown ? `다시 추천받기 (${remainMin}분 남음)` : '다시 추천받기'}
                    </button>
                  );
                })()}
              </div>
            ) : (
              /* Default: AI CTA — opens modal */
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <p className="font-semibold text-text-primary mb-1">AI 팀 추천</p>
                <p className="text-xs text-text-secondary mb-4">프로필 기반으로 최적의 팀을 추천합니다</p>
                <button
                  onClick={() => setShowRecModal(true)}
                  className="px-5 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center gap-2 mx-auto"
                >
                  <Sparkles size={16} />
                  AI 추천받기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Modal — dashboard-style flow */}
      <Modal isOpen={showRecModal} onClose={() => { if (!recLoading) setShowRecModal(false); }} maxWidth="max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">AI 팀 추천</h3>
        </div>

        {recLoading ? (
          /* Loading with step progress */
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-secondary">{REC_STEP_MESSAGES[recStep]}</p>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= recStep ? 'w-6 bg-primary' : 'w-4 bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : aiRecs ? (
          /* Results */
          <div>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {aiRecs.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">매칭되는 팀이 없습니다.</p>
              ) : (
                aiRecs.map((rec) => (
                  <AiRecCard key={rec.teamId} rec={rec} teams={teams} userRole={user?.role} />
                ))
              )}
            </div>
            <button
              onClick={() => setShowRecModal(false)}
              className="w-full px-4 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              확인
            </button>
          </div>
        ) : aiError ? (
          /* Error */
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-error">추천 분석 중 오류가 발생했습니다.</p>
            <button
              onClick={() => { setAiError(false); handleAiRecommend(); }}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        ) : (
          /* Confirm — same style as dashboard */
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-text-primary font-medium mb-1">프로필을 분석하여 최적의 팀을 추천합니다</p>
              <p className="text-xs text-text-secondary">기술 스택, 관심 분야를 기반으로 AI가 분석합니다</p>
            </div>
            <button
              onClick={handleAiRecommend}
              className="px-6 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              추천 시작하기
            </button>
          </div>
        )}
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} maxWidth="max-w-md">
        <h2 className="text-lg font-bold mb-4">팀 만들기</h2>
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
            <CustomSelect
              value={createForm.hackathonSlug}
              onChange={(v) => setCreateForm({ ...createForm, hackathonSlug: v })}
              options={[
                { value: '', label: '선택하세요' },
                ...hackathons.filter((h) => h.status !== 'ended').map((h) => ({ value: h.slug, label: h.title })),
              ]}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">모집 역할</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-[0.98] ${
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
            className="w-full px-4 py-2 bg-primary text-text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
          >
            팀 생성
          </button>
        </form>
      </Modal>

      {/* Apply Modal — replaced with shared ApplyFormModal component */}
      <ApplyFormModal
        isOpen={!!applyTeam}
        onClose={() => setApplyTeam(null)}
        teamName={applyTeam?.name || ''}
        onSend={(content) => {
          if (!applyTeam || !user) return;
          const leader = applyTeam.members[0];
          if (!leader) return;
          addMessage({
            id: `msg-${Date.now()}`,
            from: user.id,
            to: leader.userId,
            content,
            type: 'team-request',
            teamId: applyTeam.id,
            read: false,
            createdAt: new Date().toISOString(),
          });
          setToast('참가 신청이 전송되었습니다!');
          setTimeout(() => setToast(''), 3000);
        }}
      />
    </div>
  );
}
