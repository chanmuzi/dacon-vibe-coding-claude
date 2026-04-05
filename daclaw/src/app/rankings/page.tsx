'use client';

import { useState, useEffect, useMemo } from 'react';
import { Medal, Info, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRankingStore } from '@/store/ranking';
import { gradeConfig, seedBadges, GRADE_ORDER } from '@/data/seed';
import type { RankingEntry } from '@/types';
import IconMapper from '@/components/IconMapper';
import GradeBadge from '@/components/GradeBadge';
import UserAvatar from '@/components/UserAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'overall' | 'competition' | 'community';
type PeriodKey = 'all' | 'monthly' | 'weekly';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; testId: string }[] = [
  { key: 'overall', label: '종합', testId: 'ranking-tab-overall' },
  { key: 'competition', label: '대회', testId: 'ranking-tab-competition' },
  { key: 'community', label: '커뮤니티', testId: 'ranking-tab-community' },
];

const PERIODS: { key: PeriodKey; label: string; testId: string }[] = [
  { key: 'all', label: '전체', testId: 'ranking-period-all' },
  { key: 'monthly', label: '월간', testId: 'ranking-period-monthly' },
  { key: 'weekly', label: '주간', testId: 'ranking-period-weekly' },
];


// Stable pseudo-random multipliers derived from userId string (avoids hydration issues)
function stableMultiplier(userId: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0xffffffff;
  }
  const normalized = Math.abs(hash) / 0xffffffff;
  return min + normalized * (max - min);
}

function applyPeriod(entry: RankingEntry, period: PeriodKey): RankingEntry {
  if (period === 'all') return entry;
  const [min, max] = period === 'monthly' ? [0.3, 0.7] : [0.1, 0.3];
  const mult = stableMultiplier(entry.userId + period, min, max);
  return {
    ...entry,
    totalScore: Math.round(entry.totalScore * mult),
    competitionScore: Math.round(entry.competitionScore * mult),
    communityScore: Math.round(entry.communityScore * mult),
  };
}

function getScoreByTab(entry: RankingEntry, tab: TabKey): number {
  if (tab === 'competition') return entry.competitionScore;
  if (tab === 'community') return entry.communityScore;
  return entry.totalScore;
}

const BADGE_MAP = Object.fromEntries(seedBadges.map((b) => [b.id, b]));

// ─── Rank Indicator ───────────────────────────────────────────────────────────

const RANK_STYLES: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: '#FEF3C7', border: '#D4A017', text: '#92400E' },
  2: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569' },
  3: { bg: '#FED7AA', border: '#C2884A', text: '#7C2D12' },
};

function RankIndicator({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
        style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="font-mono text-sm font-semibold text-text-secondary w-8 text-center inline-block">
      {rank}
    </span>
  );
}

// ─── Ranking Row ──────────────────────────────────────────────────────────────

interface RowProps {
  rank: number;
  entry: RankingEntry;
  tab: TabKey;
}

function RankingRow({ rank, entry, tab }: RowProps) {
  const score = getScoreByTab(entry, tab);

  const scoreColor =
    rank === 1
      ? 'text-warning'
      : rank === 2
      ? 'text-info'
      : rank === 3
      ? 'text-warning'
      : 'text-primary';

  const scoreSizeClass = rank === 1 ? 'text-lg' : 'text-base';

  // Rank 1: gold bg, Rank 2/3: left accent border, Rest: plain
  const rowClasses =
    rank === 1
      ? 'bg-warning-light border border-warning/30'
      : 'bg-surface border border-border';

  const compRatio = entry.totalScore > 0
    ? Math.round((entry.competitionScore / entry.totalScore) * 100)
    : 0;

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl mb-2 transition-shadow hover:shadow-sm ${rowClasses}`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <RankIndicator rank={rank} />
      </div>

      {/* Avatar + Nickname + Grade */}
      <div className="flex items-center gap-2 shrink-0 min-w-0" style={{ width: '220px' }}>
        <UserAvatar role={entry.role} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/users/${entry.userId}`}
              className={`font-semibold truncate hover:underline cursor-pointer ${
                rank === 1 ? 'text-base text-warning' : 'text-sm text-text-primary'
              }`}
            >
              {entry.nickname}
            </Link>
            <GradeBadge grade={entry.grade} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="hidden md:flex items-center gap-1 shrink-0 w-24">
        {entry.badges.slice(0, 4).map((badgeId) => {
          const badge = BADGE_MAP[badgeId];
          if (!badge) return null;
          return (
            <span
              key={badgeId}
              className="relative group cursor-default"
              aria-label={badge.name}
            >
              <IconMapper name={badge.icon} size={14} />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-[10px] whitespace-nowrap z-20 shadow-lg pointer-events-none">
                <span className="font-semibold">{badge.name}</span>
                <span className="opacity-70">{badge.condition}</span>
              </span>
            </span>
          );
        })}
        {entry.badges.length > 4 && (
          <span className="text-xs text-text-secondary">+{entry.badges.length - 4}</span>
        )}
        {entry.badges.length === 0 && (
          <span className="text-xs text-text-secondary">—</span>
        )}
      </div>

      {/* Score composition bar — fills remaining space */}
      <div className="hidden lg:flex flex-1 items-center px-4">
        <div className="w-full h-2 rounded-full bg-border/30 overflow-hidden flex">
          {entry.totalScore > 0 && (
            <>
              <div
                className="h-full bg-primary rounded-l-full"
                style={{ width: `${compRatio}%` }}
                title={`대회 ${entry.competitionScore.toLocaleString()}pt (${compRatio}%)`}
              />
              <div
                className="h-full bg-primary/20"
                style={{ width: `${100 - compRatio}%` }}
                title={`커뮤니티 ${entry.communityScore.toLocaleString()}pt (${100 - compRatio}%)`}
              />
            </>
          )}
        </div>
      </div>

      {/* Competition Score */}
      <div className="hidden lg:block shrink-0 w-20 text-right">
        <span className="font-mono text-sm text-text-secondary">
          {entry.competitionScore.toLocaleString()}
        </span>
      </div>

      {/* Community Score */}
      <div className="hidden lg:block shrink-0 w-20 text-right">
        <span className="font-mono text-sm text-text-secondary">
          {entry.communityScore.toLocaleString()}
        </span>
      </div>

      {/* Total Score */}
      <div className="shrink-0 w-24 text-right">
        <span className={`font-mono font-bold ${scoreSizeClass} ${scoreColor}`}>
          {score.toLocaleString()}
        </span>
        <span className="text-xs text-text-secondary ml-0.5">pt</span>
      </div>
    </div>
  );
}

// ─── Score Breakdown Section ──────────────────────────────────────────────────

function ScoreBreakdown() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-text-primary">점수 산정 방식</h2>
      </div>

      <p className="text-sm text-text-secondary mb-5">
        종합 점수 = <span className="font-semibold text-text-primary">대회 성적 × 70%</span> +{' '}
        <span className="font-semibold text-text-primary">커뮤니티 활동 × 30%</span>
      </p>

      {/* Visual bar */}
      <div className="flex rounded-full overflow-hidden h-5 mb-3">
        <div
          className="bg-primary flex items-center justify-center text-xs font-semibold text-white"
          style={{ width: '70%' }}
        >
          대회 70%
        </div>
        <div
          className="bg-primary-light flex items-center justify-center text-xs font-semibold text-primary"
          style={{ width: '30%' }}
        >
          커뮤니티 30%
        </div>
      </div>

      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          <span className="text-text-secondary">대회 성적 (70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-light inline-block border border-primary/30" />
          <span className="text-text-secondary">커뮤니티 활동 (30%)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Grade Legend Section ─────────────────────────────────────────────────────

function GradeLegend() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-text-primary">등급 안내</h2>
      </div>

      <div className="flex flex-col gap-2">
        {GRADE_ORDER.slice().reverse().map((gradeKey) => {
          const cfg = gradeConfig[gradeKey];
          if (!cfg) return null;
          const isMax = cfg.max === Infinity;
          return (
            <div
              key={gradeKey}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background"
            >
              <GradeBadge grade={gradeKey} size="md" />
              <span className="text-xs text-text-secondary font-mono">
                {cfg.min.toLocaleString()}
                {isMax ? '+ pt' : ` ~ ${cfg.max.toLocaleString()} pt`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RankingsPage() {
  const { rankings, init } = useRankingStore();
  const [tab, setTab] = useState<TabKey>('overall');
  const [period, setPeriod] = useState<PeriodKey>('all');

  useEffect(() => {
    init();
  }, [init]);

  const sorted = useMemo(() => {
    return rankings
      .map((entry) => applyPeriod(entry, period))
      .sort((a, b) => getScoreByTab(b, tab) - getScoreByTab(a, tab));
  }, [rankings, tab, period]);

  return (
    <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Medal className="w-6 h-6 text-primary" />
            랭킹
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            총{' '}
            <span className="font-mono font-semibold text-primary">{rankings.length}</span>
            명의 참가자가 경쟁 중
          </p>
        </div>

        {/* Controls: tabs + period */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          {/* Category tabs */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
            {TABS.map(({ key, label, testId }) => (
              <button
                key={key}
                data-testid={testId}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  tab === key
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
            {PERIODS.map(({ key, label, testId }) => (
              <button
                key={key}
                data-testid={testId}
                onClick={() => setPeriod(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  period === key
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ranking table */}
        <div data-testid="ranking-table" className="mb-8">
          {/* Table header */}
          <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 mb-1 text-xs font-medium text-text-secondary">
            <div className="w-8 text-center shrink-0">순위</div>
            <div className="shrink-0" style={{ width: '220px' }}>참가자</div>
            <div className="hidden md:block w-24 shrink-0">배지</div>
            <div className="hidden lg:flex flex-1 px-4">점수 구성</div>
            <div className="hidden lg:block w-20 shrink-0 text-right">대회</div>
            <div className="hidden lg:block w-20 shrink-0 text-right">커뮤니티</div>
            <div className="shrink-0 w-24 text-right">
              {tab === 'competition' ? '대회 점수' : tab === 'community' ? '커뮤니티 점수' : '종합 점수'}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center gap-3 text-center">
              <BarChart3 className="w-10 h-10 text-border" />
              <p className="text-text-secondary">랭킹 데이터가 없습니다.</p>
            </div>
          ) : (
            sorted.map((entry, idx) => (
              <RankingRow key={entry.userId} rank={idx + 1} entry={entry} tab={tab} />
            ))
          )}
        </div>

        {/* Bottom sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreBreakdown />
          <GradeLegend />
        </div>
      </div>
    </div>
  );
}
