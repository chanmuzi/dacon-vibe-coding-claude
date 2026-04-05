'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  FileText,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
  Trophy,
} from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import type { Hackathon, HackathonType, Prize, EvaluationCriterion } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { type: HackathonType; testId: string; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    type: 'quantitative',
    testId: 'type-quantitative',
    label: '정량 평가',
    desc: '점수, 순위 등 수치로 측정 가능한 방식. 리더보드 기반.',
    icon: <BarChart2 className="w-8 h-8" />,
  },
  {
    type: 'qualitative',
    testId: 'type-qualitative',
    label: '정성 평가',
    desc: '심사위원 평가, 발표, 포트폴리오 기반 방식.',
    icon: <FileText className="w-8 h-8" />,
  },
  {
    type: 'hybrid',
    testId: 'type-hybrid',
    label: '혼합 평가',
    desc: '정량 + 정성을 모두 활용하는 복합 방식.',
    icon: <Layers className="w-8 h-8" />,
  },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function generateSlug(title: string): string {
  const base = slugify(title) || 'hackathon';
  return `${base}-${Date.now()}`;
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  tags: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  soloAllowed: boolean;
  maxMembers: string;
  prizes: Prize[];
  metrics: string;
  evaluationCriteria: EvaluationCriterion[];
  thumbnailUrl: string;
}

const defaultForm: FormState = {
  title: '',
  description: '',
  tags: '',
  startDate: '',
  endDate: '',
  resultDate: '',
  soloAllowed: true,
  maxMembers: '5',
  prizes: [
    { rank: 1, label: '1위', amount: '' },
    { rank: 2, label: '2위', amount: '' },
  ],
  metrics: '',
  evaluationCriteria: [{ name: '', weight: 50, description: '' }],
  thumbnailUrl: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-text-primary mb-1.5">{children}</label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary ${props.className ?? ''}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary resize-none ${props.className ?? ''}`}
    />
  );
}

// ─── Prize Editor ─────────────────────────────────────────────────────────────

interface PrizeEditorProps {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
}

function PrizeEditor({ prizes, onChange }: PrizeEditorProps) {
  function update(i: number, field: keyof Prize, value: string | number) {
    const updated = prizes.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    onChange(updated);
  }

  function add() {
    onChange([...prizes, { rank: prizes.length + 1, label: `${prizes.length + 1}위`, amount: '' }]);
  }

  function remove(i: number) {
    onChange(prizes.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      {prizes.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="순위명 (예: 1위)"
            value={p.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="상금 (예: 100만원)"
            value={p.amount}
            onChange={(e) => update(i, 'amount', e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95 w-fit"
      >
        <Plus className="w-4 h-4" />
        상금 추가
      </button>
    </div>
  );
}

// ─── Evaluation Criterion Editor ──────────────────────────────────────────────

interface CriterionEditorProps {
  criteria: EvaluationCriterion[];
  onChange: (c: EvaluationCriterion[]) => void;
}

function CriterionEditor({ criteria, onChange }: CriterionEditorProps) {
  function update(i: number, field: keyof EvaluationCriterion, value: string | number) {
    const updated = criteria.map((c, idx) => (idx === i ? { ...c, [field]: value } : c));
    onChange(updated);
  }

  function add() {
    onChange([...criteria, { name: '', weight: 0, description: '' }]);
  }

  function remove(i: number) {
    onChange(criteria.filter((_, idx) => idx !== i));
  }

  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight), 0);

  return (
    <div className="flex flex-col gap-3">
      {criteria.map((c, i) => (
        <div key={i} className="bg-background rounded-lg p-3 flex flex-col gap-2 border border-border">
          <div className="flex items-center gap-2">
            <Input
              placeholder="기준명 (예: 창의성)"
              value={c.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-1 shrink-0">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="비중"
                value={c.weight}
                onChange={(e) => update(i, 'weight', Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-text-secondary">%</span>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors"
              aria-label="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Input
            placeholder="설명 (선택)"
            value={c.description}
            onChange={(e) => update(i, 'description', e.target.value)}
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          기준 추가
        </button>
        <span className={`text-xs font-mono ${totalWeight === 100 ? 'text-success' : 'text-warning'}`}>
          합계: {totalWeight}%{totalWeight !== 100 && ' (100%여야 합니다)'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const { addHackathon, init: initHackathon } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal, init: initUser } = useUserStore();

  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<HackathonType | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    initHackathon();
    initUser();
  }, [initHackathon, initUser]);

  function updateForm(field: keyof FormState, value: FormState[keyof FormState]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = '제목을 입력하세요.';
    if (!form.description.trim()) errs.description = '설명을 입력하세요.';
    if (!form.startDate) errs.startDate = '시작일을 선택하세요.';
    if (!form.endDate) errs.endDate = '마감일을 선택하세요.';
    if (!form.resultDate) errs.resultDate = '결과 발표일을 선택하세요.';
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      errs.endDate = '마감일은 시작일 이후여야 합니다.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      openAuthModal();
      return;
    }
    if (!selectedType) return;
    if (!validate()) return;

    const tags = form.tags
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const prizes: Prize[] = form.prizes.filter((p) => p.label && p.amount);

    const hackathon: Hackathon = {
      slug: generateSlug(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      type: selectedType,
      status: (() => {
        const now = new Date();
        const start = new Date(form.startDate + 'T00:00:00');
        const end = new Date(form.endDate + 'T23:59:59');
        if (end < now) return 'ended' as const;
        if (start > now) return 'upcoming' as const;
        return 'active' as const;
      })(),
      tags,
      thumbnailUrl: form.thumbnailUrl.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      resultDate: form.resultDate,
      prizes,
      teamPolicy: {
        solo: form.soloAllowed,
        maxMembers: Math.max(1, parseInt(form.maxMembers, 10) || 5),
      },
      participantCount: 0,
      metrics: selectedType === 'quantitative' || selectedType === 'hybrid'
        ? form.metrics.split(',').map((m) => m.trim()).filter(Boolean)
        : undefined,
      evaluationCriteria:
        selectedType === 'qualitative' || selectedType === 'hybrid'
          ? form.evaluationCriteria.filter((c) => c.name.trim())
          : undefined,
      notices: [],
      milestones: [],
      isCustom: true,
      creatorId: user?.id,
      organizer: user?.nickname ?? '',
      color: '#0049DB',
    };

    addHackathon(hackathon);
    router.push('/hackathons');
  }

  // ── Type selection step ────────────────────────────────────────────────────
  if (step === 'type') {
    return (
      <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">대회 만들기</h1>
              <p className="text-sm text-text-secondary mt-0.5">Step 1 of 2 · 평가 방식 선택</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                data-testid={opt.testId}
                type="button"
                onClick={() => {
                  setSelectedType(opt.type);
                  setStep('form');
                }}
                className="bg-surface border-2 border-border rounded-xl p-6 flex flex-col items-center gap-4 text-center hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {opt.icon}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-base">{opt.label}</p>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{opt.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  선택 <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Form step ──────────────────────────────────────────────────────────────
  const typeMeta = TYPE_OPTIONS.find((o) => o.type === selectedType)!;

  return (
    <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setStep('type')}
            className="p-2 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer active:scale-95"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            {typeMeta.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">대회 만들기</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Step 2 of 2 · {typeMeta.label}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic info */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-text-primary">기본 정보</h2>

            <div>
              <Label>제목 *</Label>
              <Input
                data-testid="hackathon-title-input"
                placeholder="해커톤 대회명을 입력하세요"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
              />
              {errors.title && <p className="text-xs text-error mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label>설명 *</Label>
              <Textarea
                data-testid="hackathon-description-input"
                placeholder="대회 목적, 주제, 참가 자격 등을 설명하세요"
                rows={4}
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
              />
              {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label>태그</Label>
              <Input
                placeholder="AI, NLP, 비전 (쉼표 또는 공백으로 구분)"
                value={form.tags}
                onChange={(e) => updateForm('tags', e.target.value)}
              />
            </div>

            <div>
              <Label>썸네일 URL (선택)</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.thumbnailUrl}
                onChange={(e) => updateForm('thumbnailUrl', e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-text-primary">일정</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>시작일 *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                />
                {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label>마감일 *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                />
                {errors.endDate && <p className="text-xs text-error mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <Label>결과 발표일 *</Label>
                <Input
                  type="date"
                  value={form.resultDate}
                  onChange={(e) => updateForm('resultDate', e.target.value)}
                />
                {errors.resultDate && <p className="text-xs text-error mt-1">{errors.resultDate}</p>}
              </div>
            </div>
          </div>

          {/* Team policy */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-text-primary">팀 정책</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.soloAllowed}
                  onChange={(e) => updateForm('soloAllowed', e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-text-primary">개인 참가 허용</span>
              </label>
            </div>
            <div>
              <Label>최대 팀원 수</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.maxMembers}
                onChange={(e) => updateForm('maxMembers', e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Prizes */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-text-primary">시상</h2>
            <PrizeEditor
              prizes={form.prizes}
              onChange={(prizes) => updateForm('prizes', prizes)}
            />
          </div>

          {/* Type-dependent: metrics (quantitative / hybrid) */}
          {(selectedType === 'quantitative' || selectedType === 'hybrid') && (
            <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text-primary">평가 지표</h2>
              <div>
                <Label>지표 목록</Label>
                <Input
                  placeholder="Accuracy, F1-Score, AUC (쉼표로 구분)"
                  value={form.metrics}
                  onChange={(e) => updateForm('metrics', e.target.value)}
                />
                <p className="text-xs text-text-secondary mt-1">
                  리더보드에서 사용할 점수 지표를 입력하세요.
                </p>
              </div>
            </div>
          )}

          {/* Type-dependent: evaluation criteria (qualitative / hybrid) */}
          {(selectedType === 'qualitative' || selectedType === 'hybrid') && (
            <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text-primary">평가 기준</h2>
              <CriterionEditor
                criteria={form.evaluationCriteria}
                onChange={(c) => updateForm('evaluationCriteria', c)}
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/hackathons')}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-colors cursor-pointer active:scale-[0.98]"
            >
              취소
            </button>
            <button
              data-testid="create-submit-button"
              type="submit"
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm"
            >
              대회 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
