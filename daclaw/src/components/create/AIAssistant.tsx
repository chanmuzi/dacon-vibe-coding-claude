'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Wand2, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/CustomSelect';
import type { HackathonType } from '@/types';

interface AIGeneratedData {
  title?: string;
  description?: string;
  tags?: string[];
  type?: string;
  prizes?: { rank: number; label: string; amount: string }[];
  evaluationCriteria?: { name: string; weight: number; description: string }[];
  rules?: string[];
  faq?: { question: string; answer: string }[];
  metrics?: string[];
  submissionType?: string;
  submissionDescription?: string;
  milestoneLabels?: string[];
  milestoneDates?: string[];
  startDate?: string;
  endDate?: string;
  resultDate?: string;
}

interface AIAssistantProps {
  onApply: (data: AIGeneratedData) => void;
}

interface AIFormState {
  title: string;
  type: HackathonType | '';
  startDate: string;
  endDate: string;
  resultDate: string;
  additionalInfo: string;
}

const defaultAIForm: AIFormState = {
  title: '',
  type: '',
  startDate: '',
  endDate: '',
  resultDate: '',
  additionalInfo: '',
};

export default function AIAssistant({ onApply }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<AIFormState>(defaultAIForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormValid = form.title.trim() && form.type && form.startDate && form.endDate && form.resultDate;

  function updateForm<K extends keyof AIFormState>(field: K, value: AIFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    if (!isFormValid || loading) return;

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setResult(null);

    const typeLabel = form.type === 'quantitative' ? '정량 평가' : form.type === 'qualitative' ? '정성 평가' : '혼합 평가';
    const prompt = `대회 제목: ${form.title}\n평가 방식: ${typeLabel}\n기간: ${form.startDate} ~ ${form.endDate}\n결과 발표일: ${form.resultDate}\n${form.additionalInfo ? `추가 설명: ${form.additionalInfo}` : ''}`;

    try {
      const res = await fetch('/api/generate-hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.status === 503) {
        setError('API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
        return;
      }
      if (res.status === 429) {
        setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      if (!res.ok) {
        setError('AI 생성에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      const data = await res.json();
      if (data.result) {
        setResult({
          ...data.result,
          title: data.result.title || form.title,
          type: form.type || data.result.type,
          startDate: form.startDate,
          endDate: form.endDate,
          resultDate: form.resultDate,
          milestoneLabels: ['대회 시작', '제출 마감', '결과 발표'],
          milestoneDates: [form.startDate, form.endDate, form.resultDate],
        });
      } else {
        setError('응답을 파싱할 수 없습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    onApply(result);
    handleClose();
  }

  function handleClose() {
    setIsOpen(false);
    setResult(null);
    setForm(defaultAIForm);
    setError(null);
    setShowConfirm(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-type-qualitative text-text-on-primary text-sm font-semibold hover:bg-type-qualitative/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm ring-1 ring-type-qualitative/30"
      >
        <Sparkles className="w-4 h-4" />
        AI로 대회 생성
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-lg">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-type-qualitative/10 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-type-qualitative" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">AI 대회 생성</h3>
              <p className="text-xs text-text-secondary">필수 정보를 입력하면 나머지를 AI가 자동으로 채웁니다</p>
            </div>
          </div>

          {!result ? (
            <>
              {/* Required Fields */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    대회 제목 <span className="text-error">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="예: AI 챗봇 개발 대회"
                    maxLength={80}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    평가 방식 <span className="text-error">*</span>
                  </label>
                  <CustomSelect
                    value={form.type}
                    onChange={(v) => updateForm('type', v as HackathonType)}
                    options={[
                      { value: '', label: '선택하세요' },
                      { value: 'quantitative', label: '정량 평가' },
                      { value: 'qualitative', label: '정성 평가' },
                      { value: 'hybrid', label: '혼합 평가' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      시작일 <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => updateForm('startDate', e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      마감일 <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => updateForm('endDate', e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      결과 발표 <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.resultDate}
                      onChange={(e) => updateForm('resultDate', e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    추가 설명 <span className="text-text-secondary font-normal">(선택)</span>
                  </label>
                  <textarea
                    value={form.additionalInfo}
                    onChange={(e) => updateForm('additionalInfo', e.target.value)}
                    placeholder="대상, 주제, 특별 규칙 등 AI에게 전달할 추가 정보를 입력하세요"
                    rows={3}
                    maxLength={500}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary resize-none"
                  />
                  <p className="text-xs text-text-secondary mt-0.5 text-right">{form.additionalInfo.length}/500</p>
                </div>
              </div>

              {/* Confirm message */}
              {showConfirm && (
                <div className="bg-info-light border border-info/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  <div className="text-sm text-info">
                    <p className="font-medium">입력한 정보로 AI 대회를 생성하시겠습니까?</p>
                    <p className="text-xs mt-0.5">제목: {form.title} / 방식: {form.type === 'quantitative' ? '정량' : form.type === 'qualitative' ? '정성' : '혼합'} / {form.startDate} ~ {form.endDate}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-error-light border border-error/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 border border-border rounded-lg text-sm font-semibold text-text-secondary bg-surface hover:bg-interactive-hover transition-colors cursor-pointer active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isFormValid || loading}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                    ) : showConfirm ? (
                      <><Sparkles className="w-4 h-4" /> 확인, 생성하기</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> AI로 생성하기</>
                    )}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Result preview */}
              <div className="bg-background border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-sm text-text-primary mb-2">{result.title}</h4>
                <p className="text-xs text-text-secondary mb-2 leading-relaxed">{result.description}</p>
                {result.tags && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.tags.map((t) => (
                      <span key={t} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
                {result.evaluationCriteria && result.evaluationCriteria.length > 0 && (
                  <div className="text-xs text-text-secondary">
                    평가: {result.evaluationCriteria.map((c) => `${c.name}(${c.weight}%)`).join(', ')}
                  </div>
                )}
                {result.rules && result.rules.length > 0 && (
                  <div className="text-xs text-text-secondary mt-1">
                    규칙: {result.rules.length}개
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 border border-border rounded-lg text-sm font-semibold text-text-secondary bg-surface hover:bg-interactive-hover transition-colors cursor-pointer active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 적용하기
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
