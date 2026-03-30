'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Info } from 'lucide-react';
import { useRankingStore } from '@/store/ranking';
import { gradeConfig, seedBadges } from '@/data/seed';
import type { RankingEntry } from '@/types';
import IconMapper from '@/components/IconMapper';
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

const GRADE_ORDER: string[] = ['rookie', 'challenger', 'expert', 'master', 'legend'];

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

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} style={{ color: '#D4A017' }} />;
  if (rank === 2) return <Medal size={20} style={{ color: '#7C8A96' }} />;
  if (rank === 3) return <Medal size={18} style={{ color: '#B87333' }} />;
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
  const grade = gradeConfig[entry.grade];
  const score = getScoreByTab(entry, tab);

  const rowBg =
    rank === 1
      ? 'bg-warning-light border-warning/20'
      : rank === 2
      ? 'bg-info-light/50 border-info/10'
      : rank === 3
      ? 'bg-warning-light/30 border-warning/10'
      : 'bg-surface border-border';

  const scoreColor =
    rank === 1
      ? 'text-warning'
      : rank === 2
      ? 'text-info'
      : rank === 3
      ? 'text-warning'
      : 'text-primary';

  const scoreSizeClass = rank === 1 ? 'text-lg' : 'text-base';

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 px-4 py-3 border rounded-xl mb-2 transition-all hover:shadow-sm ${rowBg}`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <RankIndicator rank={rank} />
      </div>

      {/* Avatar + Nickname + Grade */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <UserAvatar role={entry.role} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span
              className={`font-semibold truncate ${
                rank === 1 ? 'text-base text-warning' : 'text-sm text-text-primary'
              }`}
            >
              {entry.nickname}
            </span>
            <span title={grade?.label ?? entry.grade} className="shrink-0">
              <IconMapper name={grade?.icon ?? 'Sprout'} size={16} />
            </span>
          </div>
          <span className="text-xs text-text-secondary hidden sm:block" style={{ color: grade?.color }}>
            {grade?.label}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {entry.badges.slice(0, 4).map((badgeId) => {
          const badge = BADGE_MAP[badgeId];
          if (!badge) return null;
          return (
            <span
              key={badgeId}
              title={badge.name}
              className="text-base cursor-default"
              aria-label={badge.name}
            >
              <IconMapper name={badge.icon} size={14} />
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

      {/* Score */}
      <div className="shrink-0 text-right">
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
        <Trophy className="w-4 h-4 text-primary" />
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
              <span className="text-xl shrink-0"><IconMapper name={cfg.icon} className="w-5 h-5" /></span>
              <span className="font-semibold text-sm" style={{ color: cfg.color, minWidth: 80 }}>
                {cfg.label}
              </span>
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
    <div className="min-h-screen bg-background">
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
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
            <div className="flex-1">참가자</div>
            <div className="hidden md:block w-24 shrink-0">배지</div>
            <div className="shrink-0 text-right">
              {tab === 'competition' ? '대회 점수' : tab === 'community' ? '커뮤니티 점수' : '종합 점수'}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center gap-3 text-center">
              <Trophy className="w-10 h-10 text-border" />
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
