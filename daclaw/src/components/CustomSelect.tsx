'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export default function CustomSelect({ value, onChange, options, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, close]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      {/* Toggle — bottom radius removed when open so dropdown connects seamlessly */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 border border-border bg-surface px-3 py-2 text-sm text-text-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all cursor-pointer active:scale-[0.98] ${
          isOpen ? 'rounded-t-lg rounded-b-none border-b-primary/20' : 'rounded-lg'
        }`}
      >
        {selected?.icon}
        <span className="truncate">{selected?.label ?? '선택'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-secondary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 min-w-full w-max bg-surface border border-border border-t-0 rounded-b-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                close();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                opt.value === value
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-text-primary hover:bg-interactive-hover'
              } ${i === options.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {opt.icon}
              <span className="truncate">{opt.label}</span>
              {opt.value === value && (
                <Check className="w-3.5 h-3.5 ml-auto text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
