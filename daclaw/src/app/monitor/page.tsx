'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useSubmissionStore } from '@/store/submission';
import type { Hackathon } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#0049DB', '#D9E5FC', '#60A5FA', '#93C5FD', '#BFDBFE'];

const STATUS_LABELS: Record<string, string> = {
  active: '진행중',
  upcoming: '예정',
  ended: '종료',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function daysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Health Card ──────────────────────────────────────────────────────────────

interface HealthCardProps {
  hackathon: Hackathon;
  teamCount: number;
  submissionCount: number;
}

function HealthCard({ hackathon, teamCount, submissionCount }: HealthCardProps) {
  const anomalies: string[] = [];
  if (hackathon.participantCount < 50) anomalies.push('참가자 수 부족 (50명 미만)');
  if (submissionCount < 3) anomalies.push('제출물 부족 (3건 미만)');

  const hasAnomaly = anomalies.length > 0;
  const remaining = hackathon.status === 'active' ? daysLeft(hackathon.endDate) : null;

  return (
    <div
      data-testid="health-card"
      className={`bg-surface border rounded-xl p-5 flex flex-col gap-4 shadow-sm transition-all ${
        hasAnomaly ? 'border-warning' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                hackathon.status === 'active'
                  ? 'bg-success-light text-success'
                  : hackathon.status === 'upcoming'
                  ? 'bg-info-light text-info'
                  : 'bg-background text-text-secondary'
              }`}
            >
              {hackathon.status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              )}
              {STATUS_LABELS[hackathon.status]}
            </span>
            {remaining !== null && (
              <span className="text-xs text-text-secondary font-mono">D-{remaining}</span>
            )}
          </div>
          <h3 className="font-semibold text-text-primary truncate">{hackathon.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {formatDate(hackathon.startDate)} ~ {formatDate(hackathon.endDate)}
          </p>
        </div>

        <Link
          href={`/hackathons/${hackathon.slug}`}
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
        >
          상세 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background rounded-lg p-3 text-center">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-mono font-bold text-text-primary text-lg">
            {hackathon.participantCount.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">참가자</p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-mono font-bold text-text-primary text-lg">{teamCount}</p>
          <p className="text-xs text-text-secondary">팀</p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <FileText className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-mono font-bold text-text-primary text-lg">{submissionCount}</p>
          <p className="text-xs text-text-secondary">제출</p>
        </div>
      </div>

      {/* Anomaly */}
      {hasAnomaly ? (
        <div data-testid="anomaly-indicator" className="flex flex-col gap-1.5">
          {anomalies.map((msg) => (
            <div
              key={msg}
              className="flex items-center gap-2 bg-warning-light border border-warning/20 rounded-lg px-3 py-2 text-xs text-warning"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {msg}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-success-light border border-success/20 rounded-lg px-3 py-2 text-xs text-success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          정상 운영 중
        </div>
      )}
    </div>
  );
}

// ─── Registration Trend Chart ─────────────────────────────────────────────────

interface TrendChartProps {
  hackathons: Hackathon[];
}

function RegistrationTrendChart({ hackathons }: TrendChartProps) {
  const data = hackathons.map((h) => ({
    name: h.title.length > 10 ? h.title.slice(0, 10) + '…' : h.title,
    참가자: h.participantCount,
  }));

  return (
    <div
      data-testid="monitor-chart"
      className="bg-surface border border-border rounded-xl p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-text-primary mb-4">참가자 현황 (해커톤별)</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-secondary text-sm">
          데이터 없음
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E8EEF2',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="참가자" fill="#0049DB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Team Composition Chart ───────────────────────────────────────────────────

interface TeamCompositionChartProps {
  hackathons: Hackathon[];
  teamsBySlug: Record<string, number>;
}

function TeamCompositionChart({ hackathons, teamsBySlug }: TeamCompositionChartProps) {
  const data = hackathons
    .map((h) => ({
      name: h.title.length > 12 ? h.title.slice(0, 12) + '…' : h.title,
      value: teamsBySlug[h.slug] ?? 0,
    }))
    .filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div
      data-testid="monitor-chart"
      className="bg-surface border border-border rounded-xl p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-text-primary mb-4">팀 구성 분포</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-secondary text-sm">
          팀 데이터 없음
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const n = Number(value);
                  return [`${n}팀 (${((n / total) * 100).toFixed(1)}%)`, '팀 수'];
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8EEF2',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: '#6B7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MonitorPage() {
  const { hackathons, init: initHackathon } = useHackathonStore();
  const { teams, init: initTeam } = useTeamStore();
  const { submissions, init: initSubmission } = useSubmissionStore();

  useEffect(() => {
    initHackathon();
    initTeam();
    initSubmission();
  }, [initHackathon, initTeam, initSubmission]);

  const activeHackathons = useMemo(
    () => hackathons.filter((h) => h.status === 'active'),
    [hackathons]
  );

  const allMonitored = useMemo(
    () => hackathons.filter((h) => h.status !== 'ended'),
    [hackathons]
  );

  const teamsBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of teams) {
      for (const slug of t.hackathonSlugs ?? []) {
        map[slug] = (map[slug] ?? 0) + 1;
      }
    }
    return map;
  }, [teams]);

  const submissionsBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of submissions) {
      map[s.hackathonSlug] = (map[s.hackathonSlug] ?? 0) + 1;
    }
    return map;
  }, [submissions]);

  const totalParticipants = activeHackathons.reduce((s, h) => s + h.participantCount, 0);
  const totalTeams = activeHackathons.reduce((s, h) => s + (teamsBySlug[h.slug] ?? 0), 0);

  const anomalyCount = activeHackathons.filter(
    (h) => h.participantCount < 50 || (submissionsBySlug[h.slug] ?? 0) < 3
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">운영 모니터</h1>
            <p className="text-sm text-text-secondary mt-0.5">진행중 해커톤 실시간 현황</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: '진행중 해커톤', value: activeHackathons.length, icon: <Activity className="w-5 h-5" />, color: 'text-primary' },
            { label: '전체 참가자', value: totalParticipants.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'text-primary' },
            { label: '전체 팀', value: totalTeams, icon: <Users className="w-5 h-5" />, color: 'text-primary' },
            { label: '이상 감지', value: anomalyCount, icon: <AlertTriangle className="w-5 h-5" />, color: anomalyCount > 0 ? 'text-warning' : 'text-success' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div>
                <p className={`font-mono font-bold text-xl ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {allMonitored.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RegistrationTrendChart hackathons={allMonitored} />
            <TeamCompositionChart hackathons={allMonitored} teamsBySlug={teamsBySlug} />
          </div>
        )}

        {/* Health cards */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            진행중 해커톤 헬스 체크
            <span className="ml-2 font-mono text-sm text-text-secondary">
              ({activeHackathons.length})
            </span>
          </h2>
          {anomalyCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning-light border border-warning/20 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {anomalyCount}개 이상 감지
            </span>
          )}
        </div>

        {activeHackathons.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center gap-4 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <Activity className="w-8 h-8 text-border" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">진행중인 해커톤이 없습니다</p>
              <p className="text-sm text-text-secondary mt-1">
                현재 활성 상태의 해커톤이 없습니다.
              </p>
            </div>
            <Link
              href="/hackathons"
              className="mt-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              해커톤 목록 보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeHackathons.map((h) => (
              <HealthCard
                key={h.slug}
                hackathon={h}
                teamCount={teamsBySlug[h.slug] ?? 0}
                submissionCount={submissionsBySlug[h.slug] ?? 0}
              />
            ))}
          </div>
        )}

        {/* Submission summary table */}
        {activeHackathons.length > 0 && (
          <div className="mt-8 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">제출 현황 요약</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">해커톤</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">참가자</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">팀</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">제출</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-text-secondary">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {activeHackathons.map((h) => {
                    const subs = submissionsBySlug[h.slug] ?? 0;
                    const isAnomaly = h.participantCount < 50 || subs < 3;
                    return (
                      <tr key={h.slug} className="border-t border-border hover:bg-background/60 transition-colors">
                        <td className="px-5 py-3">
                          <Link
                            href={`/hackathons/${h.slug}`}
                            className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-1"
                          >
                            {h.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-text-primary">
                          {h.participantCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-text-primary">
                          {teamsBySlug[h.slug] ?? 0}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-text-primary">{subs}</td>
                        <td className="px-5 py-3 text-center">
                          {isAnomaly ? (
                            <span className="inline-flex items-center gap-1 text-xs text-warning bg-warning-light px-2 py-0.5 rounded-full border border-warning/20">
                              <AlertTriangle className="w-3 h-3" />
                              주의
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-success bg-success-light px-2 py-0.5 rounded-full border border-success/20">
                              <CheckCircle2 className="w-3 h-3" />
                              정상
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
