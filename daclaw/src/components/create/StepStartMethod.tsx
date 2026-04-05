'use client';

import { BarChart2, FileText, Layers, ChevronRight } from 'lucide-react';
import type { HackathonType } from '@/types';

const TYPE_OPTIONS: { type: HackathonType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    type: 'quantitative',
    label: '정량 평가',
    desc: '점수, 순위 등 수치로 측정 가능한 방식. 리더보드 기반.',
    icon: <BarChart2 className="w-8 h-8" />,
  },
  {
    type: 'qualitative',
    label: '정성 평가',
    desc: '심사위원 평가, 발표, 포트폴리오 기반 방식.',
    icon: <FileText className="w-8 h-8" />,
  },
  {
    type: 'hybrid',
    label: '혼합 평가',
    desc: '정량 + 정성을 모두 활용하는 복합 방식.',
    icon: <Layers className="w-8 h-8" />,
  },
];

interface StepStartMethodProps {
  value: HackathonType | null;
  onChange: (type: HackathonType) => void;
}

export default function StepStartMethod({ value, onChange }: StepStartMethodProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-secondary">대회의 평가 방식을 선택하세요. 이후 단계에서 세부 설정이 가능합니다.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TYPE_OPTIONS.map((opt) => {
          const selected = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={`bg-surface border-2 rounded-xl p-6 flex flex-col items-center gap-4 text-center hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] group ${
                selected ? 'border-primary shadow-md' : 'border-border'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  selected
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-primary group-hover:bg-primary group-hover:text-white'
                }`}
              >
                {opt.icon}
              </div>
              <div>
                <p className="font-semibold text-text-primary text-base">{opt.label}</p>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{opt.desc}</p>
              </div>
              <div
                className={`mt-auto flex items-center gap-1 text-xs text-primary font-medium transition-opacity ${
                  selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {selected ? '선택됨' : '선택'} <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
