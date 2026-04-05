'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Label, Input, SectionCard } from './FormFields';
import CustomSelect from '@/components/CustomSelect';
import type { HackathonType, Prize, EvaluationCriterion } from '@/types';

export interface EvaluationData {
  prizes: Prize[];
  metrics: string;
  evaluationCriteria: EvaluationCriterion[];
  submissionType: 'csv' | 'json' | 'markdown';
  submissionDescription: string;
  submissionColumns: string;
  submissionMaxRows: string;
  submissionSample: string;
}

interface StepEvaluationProps {
  hackathonType: HackathonType;
  data: EvaluationData;
  onChange: <K extends keyof EvaluationData>(field: K, value: EvaluationData[K]) => void;
}

function PrizeEditor({ prizes, onChange }: { prizes: Prize[]; onChange: (p: Prize[]) => void }) {
  function update(i: number, field: keyof Prize, value: string | number) {
    onChange(prizes.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
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
            onClick={() => onChange(prizes.filter((_, idx) => idx !== i))}
            className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...prizes, { rank: prizes.length + 1, label: `${prizes.length + 1}위`, amount: '' }])}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95 w-fit"
      >
        <Plus className="w-4 h-4" /> 상금 추가
      </button>
    </div>
  );
}

function CriterionEditor({ criteria, onChange }: { criteria: EvaluationCriterion[]; onChange: (c: EvaluationCriterion[]) => void }) {
  function update(i: number, field: keyof EvaluationCriterion, value: string | number) {
    onChange(criteria.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
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
                value={c.weight}
                onChange={(e) => update(i, 'weight', Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-text-secondary">%</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(criteria.filter((_, idx) => idx !== i))}
              className="p-2 rounded-lg hover:bg-error-light text-text-secondary hover:text-error transition-colors cursor-pointer active:scale-95"
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
          onClick={() => onChange([...criteria, { name: '', weight: 0, description: '' }])}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> 기준 추가
        </button>
        <span className={`text-xs font-mono ${totalWeight === 100 ? 'text-success' : 'text-warning'}`}>
          합계: {totalWeight}%{totalWeight !== 100 && ' (100%여야 합니다)'}
        </span>
      </div>
    </div>
  );
}

export default function StepEvaluation({ hackathonType, data, onChange }: StepEvaluationProps) {
  const showMetrics = hackathonType === 'quantitative' || hackathonType === 'hybrid';
  const showCriteria = hackathonType === 'qualitative' || hackathonType === 'hybrid';

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="시상">
        <PrizeEditor prizes={data.prizes} onChange={(p) => onChange('prizes', p)} />
      </SectionCard>

      {showMetrics && (
        <SectionCard title="평가 지표 (정량)">
          <div>
            <Label>지표 목록</Label>
            <Input
              placeholder="Accuracy, F1-Score, AUC (쉼표로 구분)"
              value={data.metrics}
              onChange={(e) => onChange('metrics', e.target.value)}
            />
            <p className="text-xs text-text-secondary mt-1">리더보드에서 사용할 점수 지표를 입력하세요.</p>
          </div>
        </SectionCard>
      )}

      {showCriteria && (
        <SectionCard title="평가 기준 (정성)">
          <CriterionEditor criteria={data.evaluationCriteria} onChange={(c) => onChange('evaluationCriteria', c)} />
        </SectionCard>
      )}

      <SectionCard title="제출 형식">
        <div>
          <Label>제출 파일 형식</Label>
          <CustomSelect
            value={data.submissionType}
            onChange={(v) => onChange('submissionType', v as 'csv' | 'json' | 'markdown')}
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
              { value: 'markdown', label: 'Markdown' },
            ]}
            className="w-40"
          />
        </div>

        {(data.submissionType === 'csv' || data.submissionType === 'json') && (
          <div>
            <Label>{data.submissionType === 'csv' ? '컬럼명 (쉼표 구분)' : '키 이름 (쉼표 구분)'}</Label>
            <Input
              placeholder={data.submissionType === 'csv' ? 'id, predicted_value, confidence' : 'id, result, score'}
              value={data.submissionColumns}
              onChange={(e) => onChange('submissionColumns', e.target.value)}
            />
          </div>
        )}

        {data.submissionType !== 'markdown' && (
          <div>
            <Label>최대 행 수</Label>
            <Input
              type="number"
              min={1}
              placeholder="5000"
              value={data.submissionMaxRows}
              onChange={(e) => onChange('submissionMaxRows', e.target.value)}
              className="w-32"
            />
          </div>
        )}

        <div>
          <Label>제출 안내</Label>
          <Input
            placeholder="제출 형식에 대한 추가 설명"
            value={data.submissionDescription}
            onChange={(e) => onChange('submissionDescription', e.target.value)}
          />
        </div>

        <div>
          <Label>예시 데이터</Label>
          <textarea
            value={data.submissionSample}
            onChange={(e) => onChange('submissionSample', e.target.value)}
            placeholder={
              data.submissionType === 'csv'
                ? 'id,predicted_value\n1,45.32\n2,67.89\n3,52.14'
                : data.submissionType === 'json'
                  ? '[\n  {"id": 1, "result": "positive", "score": 0.95},\n  {"id": 2, "result": "negative", "score": 0.87}\n]'
                  : '# 프로젝트명\n\n## 1. 개요\n\n프로젝트 설명...\n\n## 2. 핵심 기능\n\n- 기능 1'
            }
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary resize-none"
          />
          <p className="text-xs text-text-secondary mt-1">참가자에게 보여질 제출 예시입니다.</p>
        </div>
      </SectionCard>
    </div>
  );
}
