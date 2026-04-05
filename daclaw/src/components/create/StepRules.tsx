'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input, SectionCard } from './FormFields';

export interface RulesData {
  rules: string[];
  faq: { question: string; answer: string }[];
  milestoneLabels: string[];
  milestoneDates: string[];
}

interface StepRulesProps {
  data: RulesData;
  onChange: <K extends keyof RulesData>(field: K, value: RulesData[K]) => void;
}

export default function StepRules({ data, onChange }: StepRulesProps) {
  // Rules
  function updateRule(i: number, value: string) {
    const updated = data.rules.map((r, idx) => (idx === i ? value : r));
    onChange('rules', updated);
  }
  function addRule() {
    onChange('rules', [...data.rules, '']);
  }
  function removeRule(i: number) {
    onChange('rules', data.rules.filter((_, idx) => idx !== i));
  }

  // FAQ
  function updateFaq(i: number, field: 'question' | 'answer', value: string) {
    const updated = data.faq.map((f, idx) => (idx === i ? { ...f, [field]: value } : f));
    onChange('faq', updated);
  }
  function addFaq() {
    onChange('faq', [...data.faq, { question: '', answer: '' }]);
  }
  function removeFaq(i: number) {
    onChange('faq', data.faq.filter((_, idx) => idx !== i));
  }

  // Milestones
  function updateMilestone(i: number, field: 'label' | 'date', value: string) {
    if (field === 'label') {
      const updated = data.milestoneLabels.map((l, idx) => (idx === i ? value : l));
      onChange('milestoneLabels', updated);
    } else {
      const updated = data.milestoneDates.map((d, idx) => (idx === i ? value : d));
      onChange('milestoneDates', updated);
    }
  }
  function addMilestone() {
    onChange('milestoneLabels', [...data.milestoneLabels, '']);
    onChange('milestoneDates', [...data.milestoneDates, '']);
  }
  function removeMilestone(i: number) {
    onChange('milestoneLabels', data.milestoneLabels.filter((_, idx) => idx !== i));
    onChange('milestoneDates', data.milestoneDates.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="대회 규칙">
        <div className="flex flex-col gap-2">
          {data.rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-background border border-border text-xs text-text-secondary font-mono flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="규칙을 입력하세요"
                  value={r}
                  onChange={(e) => updateRule(i, e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(i)}
                className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
                aria-label="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRule}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" /> 규칙 추가
          </button>
        </div>
      </SectionCard>

      <SectionCard title="대회 일정">
        <p className="text-xs text-text-secondary -mt-2">기본 3개 일정은 필수이며, 추가 일정을 자유롭게 등록할 수 있습니다.</p>
        <div className="flex flex-col gap-2">
          {data.milestoneLabels.map((_, i) => {
            const isFixed = i < 3;
            return (
              <div key={i} className="flex items-center gap-2">
                {isFixed ? (
                  <span className="flex-1 text-sm font-medium text-text-primary bg-background border border-border rounded-lg px-3 py-2.5">
                    {data.milestoneLabels[i]}
                  </span>
                ) : (
                  <Input
                    placeholder="일정명 (예: 중간 발표)"
                    value={data.milestoneLabels[i]}
                    onChange={(e) => updateMilestone(i, 'label', e.target.value)}
                    className="flex-1"
                  />
                )}
                <Input
                  type="date"
                  value={data.milestoneDates[i]}
                  onChange={(e) => updateMilestone(i, 'date', e.target.value)}
                  className="w-44"
                />
                {!isFixed && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(i)}
                    className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {isFixed && <div className="w-10" />}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addMilestone}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" /> 대회 일정 추가
          </button>
        </div>
      </SectionCard>

      <SectionCard title="FAQ (선택)">
        <div className="flex flex-col gap-3">
          {data.faq.map((f, i) => (
            <div key={i} className="bg-background rounded-lg p-4 flex flex-col gap-3 border border-border">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-text-on-primary text-xs font-bold flex items-center justify-center shrink-0">Q</span>
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="질문을 입력하세요"
                    value={f.question}
                    onChange={(e) => updateFaq(i, 'question', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-success text-text-on-primary text-xs font-bold flex items-center justify-center shrink-0">A</span>
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="답변을 입력하세요"
                    value={f.answer}
                    onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                  />
                </div>
                <div className="w-10" />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" /> FAQ 추가
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
