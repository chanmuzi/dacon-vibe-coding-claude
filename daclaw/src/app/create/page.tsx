'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft, ArrowRight, Rocket, Loader2 } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import type { Hackathon, HackathonType, Prize, EvaluationCriterion } from '@/types';

import WizardProgress from '@/components/create/WizardProgress';
import StepStartMethod from '@/components/create/StepStartMethod';
import StepBasicInfo, { type BasicInfoData } from '@/components/create/StepBasicInfo';
import StepEvaluation, { type EvaluationData } from '@/components/create/StepEvaluation';
import StepRules, { type RulesData } from '@/components/create/StepRules';
import StepPreview from '@/components/create/StepPreview';
import AIAssistant from '@/components/create/AIAssistant';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function generateSlug(title: string): string {
  const base = slugify(title) || 'custom';
  return `${base}-${Date.now()}`;
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultBasicInfo: BasicInfoData = {
  title: '',
  description: '',
  tags: '',
  thumbnailUrl: '',
  bannerColor: 'gradient-blue',
  startDate: '',
  endDate: '',
  resultDate: '',
  soloAllowed: true,
  maxMembers: '5',
};

const defaultEvaluation: EvaluationData = {
  prizes: [
    { rank: 1, label: '1위', amount: '' },
    { rank: 2, label: '2위', amount: '' },
  ],
  metrics: '',
  evaluationCriteria: [{ name: '', weight: 50, description: '' }],
  submissionType: 'csv',
  submissionDescription: '',
  submissionColumns: '',
  submissionMaxRows: '',
  submissionSample: '',
};

const defaultRules: RulesData = {
  rules: [
    '하루 최대 제출 횟수 제한 (예: 10회/일)',
    '외부 데이터 사용 시 보고서에 명시 필수',
    '부정행위(점수 조작, 타인 작품 도용 등) 적발 시 즉시 실격',
    'Git commit history에 모든 팀원의 기여 내역 명시 필수',
  ],
  faq: [
    { question: '팀원 변경이 가능한가요?', answer: '대회 기간 중 1회까지 변경 가능하며, 운영진 승인이 필요합니다.' },
    { question: '제출 형식을 잘못 제출한 경우 어떻게 하나요?', answer: '제출 마감 전까지 재제출이 가능합니다. 가장 마지막 제출물이 평가 대상입니다.' },
  ],
  milestoneLabels: ['대회 시작', '제출 마감', '결과 발표'],
  milestoneDates: ['', '', ''],
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const { addHackathon, canCreateThisMonth, init: initHackathon } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal, init: initUser } = useUserStore();

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<HackathonType | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>(defaultBasicInfo);
  const [evaluation, setEvaluation] = useState<EvaluationData>(defaultEvaluation);
  const [rulesData, setRulesData] = useState<RulesData>(defaultRules);
  const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicInfoData, string>>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initHackathon();
    initUser();
  }, [initHackathon, initUser]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // ── Field updaters ──

  const updateBasicInfo = useCallback((field: keyof BasicInfoData, value: string | boolean) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
    if (basicErrors[field]) {
      setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [basicErrors]);

  const updateEvaluation = useCallback(<K extends keyof EvaluationData>(field: K, value: EvaluationData[K]) => {
    setEvaluation((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateRules = useCallback(<K extends keyof RulesData>(field: K, value: RulesData[K]) => {
    setRulesData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Validation ──

  function validateBasicInfo(): boolean {
    const errs: Partial<Record<keyof BasicInfoData, string>> = {};
    if (!basicInfo.title.trim()) errs.title = '제목을 입력하세요.';
    if (!basicInfo.description.trim()) errs.description = '설명을 입력하세요.';
    if (!basicInfo.startDate) errs.startDate = '시작일을 선택하세요.';
    if (!basicInfo.endDate) errs.endDate = '마감일을 선택하세요.';
    if (!basicInfo.resultDate) errs.resultDate = '결과 발표일을 선택하세요.';
    if (basicInfo.startDate && basicInfo.endDate && basicInfo.startDate >= basicInfo.endDate) {
      errs.endDate = '마감일은 시작일 이후여야 합니다.';
    }
    if (basicInfo.endDate && basicInfo.resultDate && basicInfo.endDate > basicInfo.resultDate) {
      errs.resultDate = '결과 발표일은 마감일 이후여야 합니다.';
    }
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateUpTo(targetStep: number): boolean {
    if (targetStep >= 1 && !selectedType) {
      setToastMessage('평가 방식을 선택해주세요.');
      return false;
    }
    if (targetStep >= 2 && !validateBasicInfo()) {
      setToastMessage('기본 정보를 먼저 입력해주세요.');
      return false;
    }
    return true;
  }

  const maxReachableStep = (() => {
    if (!selectedType) return 0;
    if (!basicInfo.title.trim() || !basicInfo.description.trim() || !basicInfo.startDate || !basicInfo.endDate || !basicInfo.resultDate) return 1;
    return 4;
  })();

  function handleNext() {
    if (!validateUpTo(step + 1)) return;
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStepClick(target: number) {
    if (target === step) return;
    if (target < step) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target > maxReachableStep) {
      if (!selectedType) setToastMessage('평가 방식을 선택해주세요.');
      else setToastMessage('기본 정보를 먼저 입력해주세요.');
      return;
    }
    if (!validateUpTo(target)) return;
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Submit ──

  function handleSubmit() {
    if (!isLoggedIn || !user) {
      openAuthModal();
      return;
    }
    if (!selectedType) return;

    if (!canCreateThisMonth(user.id)) {
      setToastMessage('월 2회까지만 대회를 만들 수 있습니다.');
      return;
    }

    const tags = basicInfo.tags
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const prizes: Prize[] = evaluation.prizes.filter((p) => p.label && p.amount);
    const criteria: EvaluationCriterion[] = evaluation.evaluationCriteria.filter((c) => c.name.trim());
    const rules = rulesData.rules.filter((r) => r.trim());
    const faq = rulesData.faq.filter((f) => f.question.trim() && f.answer.trim());
    const milestones = rulesData.milestoneLabels
      .map((label, i) => ({
        label,
        date: rulesData.milestoneDates[i] || '',
        done: false,
      }))
      .filter((m) => m.label.trim() && m.date);

    const hackathon: Hackathon = {
      slug: generateSlug(basicInfo.title),
      title: basicInfo.title.trim(),
      description: basicInfo.description.trim(),
      type: selectedType,
      status: (() => {
        const now = new Date();
        const start = new Date(basicInfo.startDate + 'T00:00:00');
        const end = new Date(basicInfo.endDate + 'T23:59:59');
        if (end < now) return 'ended' as const;
        if (start > now) return 'upcoming' as const;
        return 'active' as const;
      })(),
      tags,
      thumbnailUrl: basicInfo.thumbnailUrl.trim(),
      startDate: basicInfo.startDate,
      endDate: basicInfo.endDate,
      resultDate: basicInfo.resultDate,
      prizes,
      teamPolicy: {
        solo: basicInfo.soloAllowed,
        maxMembers: Math.max(1, parseInt(basicInfo.maxMembers, 10) || 5),
      },
      participantCount: 0,
      metrics:
        selectedType === 'quantitative' || selectedType === 'hybrid'
          ? evaluation.metrics.split(',').map((m) => m.trim()).filter(Boolean)
          : undefined,
      evaluationCriteria:
        selectedType === 'qualitative' || selectedType === 'hybrid'
          ? criteria
          : undefined,
      submissionFormat: {
        type: evaluation.submissionType,
        ...((evaluation.submissionColumns || '').trim() && {
          columns: (evaluation.submissionColumns || '').split(',').map((c) => c.trim()).filter(Boolean),
        }),
        ...((evaluation.submissionMaxRows || '').trim() && {
          maxRows: parseInt(evaluation.submissionMaxRows || '0', 10) || undefined,
        }),
        ...((evaluation.submissionDescription || '').trim() && {
          description: (evaluation.submissionDescription || '').trim(),
        }),
        ...((evaluation.submissionSample || '').trim() && {
          sampleContent: (evaluation.submissionSample || '').trim(),
        }),
      },
      notices: [],
      milestones,
      rules: rules.length > 0 ? rules : undefined,
      faq: faq.length > 0 ? faq : undefined,
      isCustom: true,
      creatorId: user.id,
      organizer: user.nickname || '개인',
      color: '#0049DB',
    };

    setSubmitting(true);
    setToastMessage('대회를 생성하고 있습니다...');
    addHackathon(hackathon);
    setTimeout(() => {
      setToastMessage('대회가 생성되었습니다!');
      setTimeout(() => {
        router.push(`/hackathons/${hackathon.slug}`);
      }, 800);
    }, 500);
  }

  // ── AI Apply ──

  function handleAIApply(data: {
    title?: string; description?: string; tags?: string[]; type?: string;
    prizes?: { rank: number; label: string; amount: string }[];
    evaluationCriteria?: { name: string; weight: number; description: string }[];
    rules?: string[]; faq?: { question: string; answer: string }[];
    metrics?: string[]; submissionType?: string; submissionDescription?: string;
    milestoneLabels?: string[]; milestoneDates?: string[];
    startDate?: string; endDate?: string; resultDate?: string;
  }) {
    if (data.type === 'quantitative' || data.type === 'qualitative' || data.type === 'hybrid') {
      setSelectedType(data.type);
    }
    setBasicInfo((prev) => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      tags: data.tags?.join(', ') || prev.tags,
      startDate: data.startDate || prev.startDate,
      endDate: data.endDate || prev.endDate,
      resultDate: data.resultDate || prev.resultDate,
    }));
    setEvaluation((prev) => ({
      ...prev,
      prizes: data.prizes && data.prizes.length > 0 ? data.prizes : prev.prizes,
      evaluationCriteria: data.evaluationCriteria && data.evaluationCriteria.length > 0 ? data.evaluationCriteria : prev.evaluationCriteria,
      metrics: data.metrics?.join(', ') || prev.metrics,
      submissionType: (data.submissionType as 'csv' | 'json' | 'markdown') || prev.submissionType,
      submissionDescription: data.submissionDescription || prev.submissionDescription,
    }));
    setRulesData((prev) => ({
      ...prev,
      rules: data.rules && data.rules.length > 0 ? data.rules : prev.rules,
      faq: data.faq && data.faq.length > 0 ? data.faq : prev.faq,
      milestoneLabels: data.milestoneLabels && data.milestoneLabels.length > 0 ? data.milestoneLabels : prev.milestoneLabels,
      milestoneDates: data.milestoneDates && data.milestoneDates.length > 0 ? data.milestoneDates : prev.milestoneDates,
    }));
    setToastMessage('AI 생성 결과가 적용되었습니다! 미리보기에서 확인하세요.');
    setTimeout(() => {
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  }

  // ── Computed preview props ──

  const parsedTags = basicInfo.tags
    .split(/[,\s]+/)
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean);
  const parsedMetrics = evaluation.metrics.split(',').map((m) => m.trim()).filter(Boolean);
  const parsedMilestones = rulesData.milestoneLabels
    .map((label, i) => ({ label, date: rulesData.milestoneDates[i] || '' }))
    .filter((m) => m.label.trim());

  // ── Render ──

  return (
    <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => (step > 0 ? handleBack() : router.push('/hackathons'))}
            className="p-2 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer active:scale-95"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">나만의 대회 만들기</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Step {step + 1} of 5
            </p>
          </div>
          <AIAssistant onApply={handleAIApply} />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <WizardProgress current={step} maxReachable={maxReachableStep} onStepClick={handleStepClick} />
        </div>

        {/* Steps */}
        <div key={step} className="max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-right-4 duration-300">
          {step === 0 && (
            <StepStartMethod value={selectedType} onChange={setSelectedType} />
          )}
          {step === 1 && (
            <StepBasicInfo data={basicInfo} errors={basicErrors} onChange={updateBasicInfo} />
          )}
          {step === 2 && selectedType && (
            <StepEvaluation hackathonType={selectedType} data={evaluation} onChange={updateEvaluation} />
          )}
          {step === 3 && (
            <StepRules data={rulesData} onChange={updateRules} />
          )}
          {step === 4 && selectedType && (
            <StepPreview
              hackathonType={selectedType}
              title={basicInfo.title}
              description={basicInfo.description}
              tags={parsedTags}
              thumbnailUrl={basicInfo.thumbnailUrl}
              bannerColor={basicInfo.bannerColor}
              startDate={basicInfo.startDate}
              endDate={basicInfo.endDate}
              resultDate={basicInfo.resultDate}
              soloAllowed={basicInfo.soloAllowed}
              maxMembers={Math.max(1, parseInt(basicInfo.maxMembers, 10) || 5)}
              prizes={evaluation.prizes.filter((p) => p.label && p.amount)}
              metrics={parsedMetrics}
              evaluationCriteria={evaluation.evaluationCriteria.filter((c) => c.name.trim())}
              submissionType={evaluation.submissionType}
              submissionDescription={evaluation.submissionDescription}
              rules={rulesData.rules.filter((r) => r.trim())}
              faq={rulesData.faq.filter((f) => f.question.trim() && f.answer.trim())}
              milestones={parsedMilestones}
              organizer={user?.nickname || '개인'}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto flex items-center gap-3 mt-8 pt-6 border-t border-border">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2 rounded-lg bg-surface border border-border text-sm font-semibold text-text-primary hover:bg-primary-light hover:border-primary-light transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> 이전
              </span>
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-primary text-text-on-primary text-sm font-semibold hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                다음 <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-primary text-text-on-primary text-sm font-bold hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-1.5">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</> : <><Rocket className="w-4 h-4" /> 대회 만들기</>}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-text-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
