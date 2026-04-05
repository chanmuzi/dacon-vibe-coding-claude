'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { label: '평가 방식' },
  { label: '기본 정보' },
  { label: '평가 & 제출' },
  { label: '규칙 & 운영' },
  { label: '미리보기' },
];

interface WizardProgressProps {
  current: number;
  maxReachable?: number;
  onStepClick?: (step: number) => void;
}

export default function WizardProgress({ current, maxReachable = 0, onStepClick }: WizardProgressProps) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm px-5 py-4">
      <div className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReachable;
          const clickable = onStepClick && (done || active || reachable);
          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                className={`flex items-center gap-2 min-w-0 transition-all ${
                  clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-60'
                }`}
                disabled={!clickable}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                    done
                      ? 'bg-primary text-text-on-primary shadow-sm'
                      : active
                        ? 'bg-primary text-text-on-primary shadow-sm ring-4 ring-primary-light'
                        : reachable
                          ? 'bg-primary-light text-primary border border-primary/30'
                          : 'bg-background text-text-secondary border border-border'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-xs truncate hidden sm:block transition-colors ${
                    active ? 'font-bold text-primary' : done ? 'font-semibold text-text-primary' : reachable ? 'font-medium text-primary/70' : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      done ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
