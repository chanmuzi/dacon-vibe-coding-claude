'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  User, Star, CheckCircle2, BookmarkCheck, Users,
  Bell, ChevronRight, Zap, Target, TrendingUp, Mail,
  MailOpen, Shield, HelpCircle, Lock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

import { useUserStore } from '@/store/user';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useSubmissionStore } from '@/store/submission';
import { useMissionStore } from '@/store/mission';
import { useMessageStore } from '@/store/message';
import { gradeConfig, seedBadges } from '@/data/seed';
import type { Role } from '@/types';
import IconMapper from '@/components/IconMapper';
import UserAvatar from '@/components/UserAvatar';
import Modal from '@/components/Modal';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { value: Role; label: string }[] = [
  { value: 'developer', label: '개발자' },
  { value: 'designer', label: '디자이너' },
  { value: 'planner', label: '기획자' },
  { value: 'data-scientist', label: '데이터 사이언티스트' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-success bg-success-light',
  medium: 'text-warning bg-warning-light',
  hard: 'text-error bg-error-light',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

const BADGE_MAP = Object.fromEntries(seedBadges.map((b) => [b.id, b]));

const GRADE_ORDER = ['rookie', 'challenger', 'expert', 'master', 'legend'];

// Mock point history data (H2)
const POINT_HISTORY: { date: string; reason: string; points: number }[] = [
  { date: '2026-03-29', reason: '일일 출석', points: 5 },
  { date: '2026-03-28', reason: '미션 완료: 커뮤니티 글 1개 작성', points: 10 },
  { date: '2026-03-27', reason: '미션 완료: 해커톤 1개 북마크하기', points: 5 },
  { date: '2026-03-26', reason: '대회 제출: AI 이미지 생성 챌린지', points: 50 },
  { date: '2026-03-25', reason: '일일 출석', points: 5 },
  { date: '2026-03-24', reason: '미션 완료: 팀원에게 DM 보내기', points: 10 },
  { date: '2026-03-23', reason: '미션 완료: 제출 1회 완료', points: 20 },
  { date: '2026-03-22', reason: '대회 제출: 바이브 코딩 대회 2026', points: 50 },
  { date: '2026-03-21', reason: '일일 출석', points: 5 },
  { date: '2026-03-20', reason: '미션 완료: 팀에 참가 신청하기', points: 15 },
];

// Extra mock messages to supplement seed data (H4)
const EXTRA_MESSAGES = [
  {
    id: 'msg-extra-1',
    from: 'user-3',
    to: 'current-user',
    content: '안녕하세요! 팀 관련해서 문의드립니다. 혹시 개발자 포지션 아직 여석 있나요?',
    type: 'dm' as const,
    read: false,
    createdAt: '2026-03-29',
  },
  {
    id: 'msg-extra-2',
    from: 'system',
    to: 'current-user',
    content: '바이브 코딩 대회 중간 발표가 예정되어 있습니다. 3월 30일 오후 2시에 Discord에서 진행됩니다.',
    type: 'announcement' as const,
    read: false,
    createdAt: '2026-03-28',
  },
];

// ─── Not Logged In ────────────────────────────────────────────────────────────

function NotLoggedIn() {
  const { openAuthModal } = useUserStore();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-12 flex flex-col items-center gap-4 text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">로그인이 필요합니다</h2>
        <p className="text-text-secondary text-sm">
          대시보드를 이용하려면 먼저 로그인해주세요.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-2 px-6 py-2.5 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          로그인
        </button>
      </div>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  testId,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      data-testid={testId}
      className="bg-surface border border-border rounded-2xl shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h2 className="font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Grade Modal ──────────────────────────────────────────────────────────────

function GradeModal({ isOpen, onClose, userPoints, userGrade }: { isOpen: boolean; onClose: () => void; userPoints: number; userGrade: string }) {
  const gradeTable = [
    { key: 'rookie', range: '0 – 99 pt' },
    { key: 'challenger', range: '100 – 499 pt' },
    { key: 'expert', range: '500 – 1,499 pt' },
    { key: 'master', range: '1,500 – 4,999 pt' },
    { key: 'legend', range: '5,000+ pt' },
  ];

  const gradeIdx = GRADE_ORDER.indexOf(userGrade);
  const nextGradeKey = gradeIdx < GRADE_ORDER.length - 1 ? GRADE_ORDER[gradeIdx + 1] : null;
  const nextCfg = nextGradeKey ? gradeConfig[nextGradeKey] : null;
  const ptsLeft = nextCfg ? Math.max(0, nextCfg.min - userPoints) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xs">
      <h3 className="font-semibold text-text-primary mb-4">등급 안내</h3>
      <div className="flex flex-col gap-1.5 mb-4">
        {gradeTable.map(({ key, range }) => {
          const cfg = gradeConfig[key];
          const isCurrent = key === userGrade;
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isCurrent ? 'bg-primary-light border border-primary/30' : ''}`}
            >
              <IconMapper name={cfg?.icon ?? 'Sprout'} size={18} />
              <span className="font-medium text-sm" style={{ color: cfg?.color }}>
                {cfg?.label}
              </span>
              <span className="ml-auto text-xs text-text-secondary font-mono">{range}</span>
              {isCurrent && (
                <span className="text-xs px-1.5 py-0.5 bg-primary text-text-on-primary rounded font-medium">현재</span>
              )}
            </div>
          );
        })}
      </div>
      {nextCfg && (
        <p className="text-xs text-text-secondary text-center">
          다음 등급 <span className="font-semibold" style={{ color: nextCfg.color }}>{nextCfg.label}</span>까지{' '}
          <span className="font-mono font-semibold text-text-primary">{ptsLeft.toLocaleString()} pt</span> 남음
        </p>
      )}
      {!nextCfg && (
        <p className="text-xs text-text-secondary text-center font-medium">최고 등급 달성!</p>
      )}
    </Modal>
  );
}

// ─── Profile Form ──────────────────────────────────────────────────────────────

function ProfileForm() {
  const { user, updateProfile } = useUserStore();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'developer');
  const [techStack, setTechStack] = useState((user?.techStack ?? []).join(', '));
  const [interests, setInterests] = useState((user?.interests ?? []).join(', '));
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      nickname: nickname.trim(),
      role,
      techStack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
      interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="프로필 편집" icon={<User className="w-4 h-4" />} testId="profile-form">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">역할</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-primary transition-colors"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            기술 스택 <span className="font-normal">(쉼표로 구분)</span>
          </label>
          <input
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="React, TypeScript, Python"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            관심 분야 <span className="font-normal">(쉼표로 구분)</span>
          </label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="AI, 웹개발, 데이터 분석"
          />
        </div>

        <button
          type="submit"
          className={`self-end px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
            saved
              ? 'bg-success text-text-on-primary'
              : 'bg-primary text-text-on-primary hover:bg-primary/90'
          }`}
        >
          {saved ? '저장 완료!' : '저장'}
        </button>
      </form>
    </SectionCard>
  );
}

// ─── Grade / Badge Panel ───────────────────────────────────────────────────────

function BadgePanel() {
  const { user, updateProfile } = useUserStore();
  const [showGradeModal, setShowGradeModal] = useState(false);

  if (!user) return null;

  const cfg = gradeConfig[user.grade];
  const gradeIdx = GRADE_ORDER.indexOf(user.grade);
  const nextGradeKey = gradeIdx < GRADE_ORDER.length - 1 ? GRADE_ORDER[gradeIdx + 1] : null;
  const nextCfg = nextGradeKey ? gradeConfig[nextGradeKey] : null;

  const progressMin = cfg?.min ?? 0;
  const progressMax = nextCfg ? nextCfg.min : cfg?.min ?? 0;
  const progressPct =
    progressMax > progressMin
      ? Math.min(100, Math.round(((user.points - progressMin) / (progressMax - progressMin)) * 100))
      : 100;

  const selectedBadges: string[] = user.selectedBadges ?? [];
  const currentUser = user;

  function handleBadgeToggle(badgeId: string) {
    const owned = currentUser.badges.includes(badgeId);
    if (!owned) return;
    let next: string[];
    if (selectedBadges.includes(badgeId)) {
      next = selectedBadges.filter((b) => b !== badgeId);
    } else {
      if (selectedBadges.length >= 3) return;
      next = [...selectedBadges, badgeId];
    }
    updateProfile({ selectedBadges: next });
  }

  return (
    <>
      <GradeModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        userPoints={user.points}
        userGrade={user.grade}
      />
      <SectionCard title="등급 & 배지" icon={<Star className="w-4 h-4" />} testId="badge-panel">
        {/* Current grade */}
        <div className="flex items-center gap-3 mb-5">
          <IconMapper name={cfg?.icon ?? 'Sprout'} size={36} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary text-lg" style={{ color: cfg?.color }}>
                {cfg?.label ?? user.grade}
              </span>
              <button
                onClick={() => setShowGradeModal(true)}
                className="text-text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95"
                title="등급 기준 보기"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-text-secondary font-mono">
              {user.points.toLocaleString()} pt
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {nextCfg && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>다음 등급: <span className="font-semibold" style={{ color: nextCfg.color }}>{nextCfg.label}</span></span>
              <span className="font-mono">{progressPct}%</span>
            </div>
            <div className="h-2 bg-primary-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: cfg?.color ?? '#0049DB' }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1 font-mono">
              <span>{progressMin.toLocaleString()} pt</span>
              <span>{nextCfg.min.toLocaleString()} pt</span>
            </div>
          </div>
        )}

        {/* Acquired badges — selectable (H5) */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">획득한 배지 <span className="font-normal">(최대 3개 선택)</span></p>
          {user.badges.length === 0 ? (
            <p className="text-sm text-text-secondary">아직 획득한 배지가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badgeId) => {
                const badge = BADGE_MAP[badgeId];
                if (!badge) return null;
                const isSelected = selectedBadges.includes(badgeId);
                return (
                  <button
                    key={badgeId}
                    title={badge.condition}
                    onClick={() => handleBadgeToggle(badgeId)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-primary-light text-primary border-2 border-primary'
                        : 'bg-primary-light text-primary border-2 border-transparent hover:border-primary/40'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    )}
                    <IconMapper name={badge.icon} size={14} />
                    <span>{badge.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {selectedBadges.length > 0 && (
            <p className="text-xs text-text-secondary mt-2">
              선택된 배지는 리더보드와 프로필에 표시됩니다
            </p>
          )}
        </div>

        {/* All available badges (locked) */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-text-secondary mb-2">전체 배지</p>
          <div className="flex flex-wrap gap-2">
            {seedBadges.map((badge) => {
              const owned = user.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  title={owned ? badge.condition : `미획득 — ${badge.condition}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-opacity ${
                    owned
                      ? 'bg-primary-light text-primary font-medium'
                      : 'bg-border/40 text-text-secondary opacity-50'
                  }`}
                >
                  {!owned && <Lock className="w-3 h-3 shrink-0" />}
                  <IconMapper name={badge.icon} size={14} />
                  <span>{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// ─── Point History ────────────────────────────────────────────────────────────

function PointHistory() {
  return (
    <SectionCard
      title="포인트 내역"
      icon={<Zap className="w-4 h-4" />}
      id="section-points"
    >
      <div className="flex flex-col gap-0">
        {POINT_HISTORY.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
            <div className="flex flex-col items-center shrink-0 w-16">
              <span className="text-xs text-text-secondary font-mono">{entry.date.slice(5)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{entry.reason}</p>
            </div>
            <span className="shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">
              +{entry.points}pt
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Daily Missions ───────────────────────────────────────────────────────────

function DailyMissions() {
  const { missions, toggleMission, init } = useMissionStore();
  const { addPoints } = useUserStore();

  useEffect(() => {
    init();
  }, [init]);

  function handleToggle(id: string, points: number, completed: boolean) {
    if (!completed) {
      toggleMission(id, (pts) => addPoints(pts));
    } else {
      toggleMission(id);
    }
  }

  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <SectionCard
      title="오늘의 미션"
      icon={<Target className="w-4 h-4" />}
      id="section-missions"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-secondary">
          {completedCount}/{missions.length} 완료
        </span>
        <div className="flex gap-1">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`w-2 h-2 rounded-full transition-colors ${m.completed ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <button
            key={mission.id}
            data-testid="daily-mission-item"
            onClick={() => handleToggle(mission.id, mission.points, mission.completed)}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98] w-full ${
              mission.completed
                ? 'completed bg-primary-light border-primary/20'
                : 'bg-surface border-border hover:border-primary/40 hover:bg-primary-light/30'
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 transition-colors ${
                mission.completed ? 'text-primary' : 'text-border'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium transition-colors ${
                  mission.completed
                    ? 'line-through text-text-secondary'
                    : 'text-text-primary'
                }`}
              >
                {mission.title}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">{mission.description}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[mission.difficulty] ?? ''}`}
              >
                {DIFFICULTY_LABELS[mission.difficulty] ?? mission.difficulty}
              </span>
              <span className="text-xs font-mono font-semibold text-primary">+{mission.points}pt</span>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Submission Chart ─────────────────────────────────────────────────────────

function SubmissionChart() {
  const { submissions } = useSubmissionStore();
  const { user } = useUserStore();

  const { teams } = useTeamStore();

  const chartData = useMemo(() => {
    if (!user) return [];
    const myTeamIds = new Set(
      teams.filter((t) => t.members.some((m) => m.userId === user.id)).map((t) => t.id)
    );
    const userSubs = submissions
      .filter((s) => s.score !== undefined && s.score !== null && (myTeamIds.has(s.teamId) || s.teamId === `solo-${user.id}`))
      .slice()
      .sort((a, b) => a.version - b.version)
      .map((s) => ({
        name: `v${s.version}`,
        score: s.score ?? 0,
        hackathon: s.hackathonSlug,
      }));
    return userSubs;
  }, [submissions, user, teams]);

  return (
    <SectionCard
      title="제출 히스토리"
      icon={<TrendingUp className="w-4 h-4" />}
      testId="submission-history-chart"
      id="section-submissions"
    >
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <TrendingUp className="w-8 h-8 text-border" />
          <p className="text-sm text-text-secondary">제출 기록이 없습니다.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9E5FC" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#D9E5FC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #E8EEF2',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`${value}점`, '점수']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0049DB"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ fill: '#0049DB', r: 3 }}
              activeDot={{ r: 5, fill: '#0049DB' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <p className="text-xs text-text-secondary mt-2">총 {chartData.length}개의 제출 기록</p>
    </SectionCard>
  );
}

// ─── Bookmarked Hackathons ────────────────────────────────────────────────────

function BookmarkedHackathons() {
  const { hackathons, bookmarks } = useHackathonStore();

  const bookmarked = useMemo(() => {
    return bookmarks
      .map((bm) => hackathons.find((h) => h.slug === bm.hackathonSlug))
      .filter((h): h is NonNullable<typeof h> => h !== undefined)
      .sort((a, b) => (a.endDate < b.endDate ? -1 : 1));
  }, [hackathons, bookmarks]);

  const statusLabel: Record<string, string> = {
    active: '진행중',
    upcoming: '예정',
    ended: '종료',
  };

  const statusColor: Record<string, string> = {
    active: 'text-success bg-success-light',
    upcoming: 'text-warning bg-warning-light',
    ended: 'text-text-secondary bg-background',
  };

  return (
    <SectionCard
      title="북마크한 해커톤"
      icon={<BookmarkCheck className="w-4 h-4" />}
      id="section-bookmarks"
    >
      {bookmarked.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <BookmarkCheck className="w-8 h-8 text-border" />
          <p className="text-sm text-text-secondary">북마크한 해커톤이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarked.map((h) => (
            <a
              key={h.slug}
              href={`/hackathons/${h.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-light/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {h.title}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 font-mono">
                  마감: {h.endDate}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[h.status] ?? ''}`}
              >
                {statusLabel[h.status] ?? h.status}
              </span>
              <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-primary shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Team Memberships ─────────────────────────────────────────────────────────

function TeamMemberships() {
  const { teams } = useTeamStore();
  const { user } = useUserStore();

  const myTeams = useMemo(() => {
    if (!user) return [];
    return teams.filter((t) => t.members.some((m) => m.userId === user.id));
  }, [teams, user]);

  const roleLabel: Record<Role, string> = {
    developer: '개발자',
    designer: '디자이너',
    planner: '기획자',
    'data-scientist': '데이터 사이언티스트',
  };

  return (
    <SectionCard title="내 팀" icon={<Users className="w-4 h-4" />}>
      {myTeams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Users className="w-8 h-8 text-border" />
          <p className="text-sm text-text-secondary">참가 중인 팀이 없습니다.</p>
          <a
            href="/camp"
            className="text-xs text-primary hover:underline"
          >
            팀 찾아보기 →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {myTeams.map((team) => {
            const myMember = team.members.find((m) => m.userId === user?.id);
            return (
              <div
                key={team.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{team.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{(team.hackathonSlugs ?? []).join(', ') || '미정'}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-secondary font-mono">
                    {team.members.length}/{team.maxMembers}명
                  </span>
                  {myMember && (
                    <span className="text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full font-medium">
                      {roleLabel[myMember.role] ?? myMember.role}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Messages ─────────────────────────────────────────────────────────────────

function Messages() {
  const { messages, markRead, init } = useMessageStore();
  const { user } = useUserStore();

  useEffect(() => {
    init();
  }, [init]);

  const myMessages = useMemo(() => {
    if (!user) return [];
    const storeMessages = messages
      .filter((m) => m.to === user.id || m.from === user.id)
      .slice()
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

    // Merge extra mock messages (H4) if they don't already exist
    const extraMapped = EXTRA_MESSAGES
      .filter((em) => !storeMessages.some((m) => m.id === em.id))
      .map((em) => ({ ...em, to: user.id }));

    return [...extraMapped, ...storeMessages].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [messages, user]);

  const unreadCount = myMessages.filter((m) => !m.read && m.to === user?.id).length;

  return (
    <SectionCard
      title={`메시지 & 알림${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      icon={<Bell className="w-4 h-4" />}
    >
      {myMessages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Bell className="w-8 h-8 text-border" />
          <p className="text-sm text-text-secondary">메시지가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {myMessages.map((msg) => {
            const isUnread = !msg.read && msg.to === user?.id;
            const isTeamRequest = msg.type === 'team-request';
            const isAnnouncement = msg.type === 'announcement';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isUnread
                    ? 'border-primary/30 bg-primary-light/30'
                    : 'border-border bg-surface'
                }`}
              >
                {isUnread ? (
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <MailOpen className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isTeamRequest && (
                      <span className="text-xs px-1.5 py-0.5 bg-warning-light text-warning rounded font-medium">
                        팀 요청
                      </span>
                    )}
                    {isAnnouncement && (
                      <span className="text-xs px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium">
                        공지
                      </span>
                    )}
                    <span className="text-xs text-text-secondary font-mono">{msg.createdAt}</span>
                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-text-primary line-clamp-2">{msg.content}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {msg.from === user?.id ? `→ ${msg.to}` : `← ${msg.from}`}
                  </p>
                </div>
                {isUnread && msg.id.startsWith('msg-extra-') ? null : isUnread && (
                  <button
                    onClick={() => markRead(msg.id)}
                    className="text-xs text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    읽음
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { user } = useUserStore();
  const { bookmarks } = useHackathonStore();
  const { teams } = useTeamStore();
  const { submissions } = useSubmissionStore();
  const { missions } = useMissionStore();

  if (!user) return null;

  const myTeamCount = teams.filter((t) => t.members.some((m) => m.userId === user.id)).length;
  const completedMissions = missions.filter((m) => m.completed).length;

  const stats = [
    {
      label: '포인트',
      value: user.points.toLocaleString(),
      unit: 'pt',
      icon: <Zap className="w-4 h-4" />,
      sectionId: 'section-points',
    },
    {
      label: '북마크',
      value: bookmarks.length.toString(),
      unit: '개',
      icon: <BookmarkCheck className="w-4 h-4" />,
      sectionId: 'section-bookmarks',
    },
    {
      label: '참가 팀',
      value: myTeamCount.toString(),
      unit: '개',
      icon: <Users className="w-4 h-4" />,
      sectionId: null,
    },
    {
      label: '제출 횟수',
      value: submissions.filter((s) => {
        const myTeamIds = new Set(teams.filter((t) => t.members.some((m) => m.userId === user.id)).map((t) => t.id));
        return myTeamIds.has(s.teamId) || s.teamId === `solo-${user.id}`;
      }).length.toString(),
      unit: '회',
      icon: <TrendingUp className="w-4 h-4" />,
      sectionId: 'section-submissions',
    },
    {
      label: '오늘의 미션',
      value: completedMissions.toString(),
      unit: `/${missions.length}`,
      icon: <Target className="w-4 h-4" />,
      sectionId: 'section-missions',
    },
  ];

  function scrollTo(id: string | null) {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          onClick={() => scrollTo(s.sectionId)}
          className={`bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
            s.sectionId
              ? 'cursor-pointer hover:border-primary-light hover:shadow-sm'
              : ''
          }`}
        >
          <span className="text-primary shrink-0">{s.icon}</span>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono font-bold text-lg text-text-primary">{s.value}</span>
              <span className="text-xs text-text-secondary">{s.unit}</span>
            </div>
            <div className="text-xs text-text-secondary">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoggedIn, init: initUser } = useUserStore();
  const { init: initHackathon } = useHackathonStore();
  const { init: initTeam } = useTeamStore();
  const { init: initSubmission } = useSubmissionStore();

  useEffect(() => {
    initUser();
    initHackathon();
    initTeam();
    initSubmission();
  }, [initUser, initHackathon, initTeam, initSubmission]);

  if (!isLoggedIn || !user) {
    return <NotLoggedIn />;
  }

  const cfg = gradeConfig[user.grade];

  return (
    <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <UserAvatar role={user.role} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                {user.nickname}
                <span title={cfg?.label ?? user.grade} style={{ color: cfg?.color }}><IconMapper name={cfg?.icon ?? 'Sprout'} size={20} /></span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-sm text-text-secondary">{user.email}</span>
                <span className="text-xs text-text-secondary">·</span>
                <span className="text-xs text-text-secondary">가입일: {user.joinedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="flex flex-col gap-6">
            <ProfileForm />
            <Messages />
          </div>

          {/* Middle column */}
          <div className="flex flex-col gap-6">
            <BadgePanel />
            <DailyMissions />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <PointHistory />
            <SubmissionChart />
            <BookmarkedHackathons />
            <TeamMemberships />
          </div>

        </div>
      </div>
    </div>
  );
}
