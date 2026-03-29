'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitCompare, ChevronDown, X, Trophy, Users, Calendar, Tag, Award, CheckCircle2 } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import type { Hackathon } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  quantitative: '정량',
  qualitative: '정성',
  hybrid: '혼합',
};

const STATUS_LABELS: Record<string, string> = {
  active: '진행중',
  upcoming: '예정',
  ended: '종료',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  ended: 'bg-gray-100 text-gray-500',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface SelectProps {
  testId: string;
  value: string;
  onChange: (slug: string) => void;
  hackathons: Hackathon[];
  excluded: string[];
  placeholder: string;
}

function HackathonSelect({ testId, value, onChange, hackathons, excluded, placeholder }: SelectProps) {
  return (
    <div className="relative">
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {hackathons
          .filter((h) => !excluded.includes(h.slug) || h.slug === value)
          .map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.title}
            </option>
          ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
    </div>
  );
}

// ─── Comparison Table ─────────────────────────────────────────────────────────

interface TableProps {
  selected: (Hackathon | undefined)[];
}

function CompareTable({ selected }: TableProps) {
  const filled = selected.filter(Boolean) as Hackathon[];
  if (filled.length === 0) return null;

  const rows: { label: string; icon: React.ReactNode; render: (h: Hackathon) => React.ReactNode }[] = [
    {
      label: '제목',
      icon: <Trophy className="w-4 h-4" />,
      render: (h) => (
        <span className="font-semibold text-text-primary text-sm leading-snug">{h.title}</span>
      ),
    },
    {
      label: '유형',
      icon: <Tag className="w-4 h-4" />,
      render: (h) => (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary">
          {TYPE_LABELS[h.type] ?? h.type}
        </span>
      ),
    },
    {
      label: '상태',
      icon: <CheckCircle2 className="w-4 h-4" />,
      render: (h) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[h.status] ?? ''}`}>
          {STATUS_LABELS[h.status] ?? h.status}
        </span>
      ),
    },
    {
      label: '시작일',
      icon: <Calendar className="w-4 h-4" />,
      render: (h) => <span className="font-mono text-sm text-text-primary">{formatDate(h.startDate)}</span>,
    },
    {
      label: '마감일',
      icon: <Calendar className="w-4 h-4" />,
      render: (h) => <span className="font-mono text-sm text-text-primary">{formatDate(h.endDate)}</span>,
    },
    {
      label: '결과 발표',
      icon: <Calendar className="w-4 h-4" />,
      render: (h) => <span className="font-mono text-sm text-text-primary">{formatDate(h.resultDate)}</span>,
    },
    {
      label: '상금',
      icon: <Award className="w-4 h-4" />,
      render: (h) => (
        <div className="flex flex-col gap-1 items-center">
          {h.prizes.slice(0, 3).map((p) => (
            <div key={p.rank} className="text-xs text-text-primary">
              <span className="text-text-secondary mr-1">{p.label}</span>
              <span className="font-mono font-semibold text-primary">{p.amount}</span>
            </div>
          ))}
          {h.prizes.length === 0 && <span className="text-text-secondary text-xs">없음</span>}
        </div>
      ),
    },
    {
      label: '참가자',
      icon: <Users className="w-4 h-4" />,
      render: (h) => (
        <span className="font-mono font-semibold text-text-primary">
          {h.participantCount.toLocaleString()}명
        </span>
      ),
    },
    {
      label: '태그',
      icon: <Tag className="w-4 h-4" />,
      render: (h) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {h.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
          {h.tags.length === 0 && <span className="text-text-secondary text-xs">없음</span>}
        </div>
      ),
    },
    {
      label: '팀 정책',
      icon: <Users className="w-4 h-4" />,
      render: (h) => (
        <div className="text-xs text-text-primary flex flex-col gap-0.5 items-center">
          <span>{h.teamPolicy.solo ? '개인 참가 가능' : '팀 전용'}</span>
          <span className="text-text-secondary">최대 {h.teamPolicy.maxMembers}명</span>
        </div>
      ),
    },
    {
      label: '평가 기준',
      icon: <CheckCircle2 className="w-4 h-4" />,
      render: (h) => (
        <div className="flex flex-col gap-1 items-center">
          {h.evaluationCriteria && h.evaluationCriteria.length > 0 ? (
            h.evaluationCriteria.slice(0, 3).map((c) => (
              <div key={c.name} className="text-xs text-text-primary flex items-center gap-1">
                <span>{c.name}</span>
                <span className="font-mono text-primary font-semibold">({c.weight}%)</span>
              </div>
            ))
          ) : h.metrics && h.metrics.length > 0 ? (
            h.metrics.map((m) => (
              <span key={m} className="text-xs bg-background text-text-secondary px-2 py-0.5 rounded">
                {m}
              </span>
            ))
          ) : (
            <span className="text-text-secondary text-xs">없음</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table data-testid="compare-table" className="w-full border-collapse text-sm min-w-[600px]">
        <thead>
          <tr>
            <th className="px-4 py-3 bg-background border border-border text-left text-xs font-semibold text-text-secondary w-32">
              항목
            </th>
            {selected.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 bg-primary text-white border border-primary text-center text-xs font-semibold"
                style={{ width: `${(100 - 20) / selected.length}%` }}
              >
                {h ? h.title : <span className="text-primary-light font-normal">선택 안 됨</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-background/60 transition-colors">
              <td className="px-4 py-3 border border-border bg-background font-medium text-text-secondary text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary">{row.icon}</span>
                  {row.label}
                </div>
              </td>
              {selected.map((h, i) => (
                <td key={i} className="px-4 py-4 text-center border border-border bg-surface">
                  {h ? row.render(h) : <span className="text-text-secondary text-sm">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function CompareInner() {
  const searchParams = useSearchParams();
  const { hackathons, init } = useHackathonStore();

  const [slugs, setSlugs] = useState<[string, string, string]>(['', '', '']);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const param = searchParams.get('slugs');
    if (param) {
      const parts = param.split(',').slice(0, 3);
      setSlugs([parts[0] ?? '', parts[1] ?? '', parts[2] ?? '']);
    }
  }, [searchParams]);

  function setSlug(index: 0 | 1 | 2, value: string) {
    setSlugs((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  }

  function clearSlug(index: 0 | 1 | 2) {
    setSlug(index, '');
  }

  const selected = slugs.map((s) => (s ? hackathons.find((h) => h.slug === s) : undefined));
  const filledCount = slugs.filter(Boolean).length;

  const excluded0 = [slugs[1], slugs[2]].filter(Boolean) as string[];
  const excluded1 = [slugs[0], slugs[2]].filter(Boolean) as string[];
  const excluded2 = [slugs[0], slugs[1]].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">해커톤 비교</h1>
          </div>
          <p className="text-text-secondary text-sm ml-13">
            최대 3개의 해커톤을 선택해 나란히 비교하세요.
          </p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {([0, 1, 2] as const).map((i) => {
            const excluded = [excluded0, excluded1, excluded2][i];
            const testIds = ['compare-select-1', 'compare-select-2', 'compare-select-3'] as const;
            return (
              <div key={i} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">해커톤 {i + 1}</span>
                  {slugs[i] && (
                    <button
                      onClick={() => clearSlug(i)}
                      className="ml-auto p-1 rounded-full hover:bg-border transition-colors"
                      aria-label="선택 해제"
                    >
                      <X className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  )}
                </div>
                <HackathonSelect
                  testId={testIds[i]}
                  value={slugs[i]}
                  onChange={(v) => setSlug(i, v)}
                  hackathons={hackathons}
                  excluded={excluded}
                  placeholder={`해커톤 ${i + 1} 선택...`}
                />
                {selected[i] && (
                  <div className="mt-2 px-3 py-2 bg-primary-light rounded-lg text-xs text-primary font-medium truncate">
                    {selected[i]!.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        {filledCount === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center gap-4 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <GitCompare className="w-8 h-8 text-border" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">해커톤을 선택하세요</p>
              <p className="text-sm text-text-secondary mt-1">
                위에서 비교할 해커톤을 1~3개 선택하면 비교표가 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <CompareTable selected={selected as (Hackathon | undefined)[]} />
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse h-8 w-48 bg-border rounded mb-4" />
          <div className="animate-pulse h-40 w-full bg-border rounded-xl" />
        </div>
      }
    >
      <CompareInner />
    </Suspense>
  );
}
