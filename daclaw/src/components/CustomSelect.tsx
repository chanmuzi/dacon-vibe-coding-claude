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
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useRef(`cs-list-${Math.random().toString(36).slice(2, 8)}`).current;

  const close = useCallback(() => { setIsOpen(false); setFocusIndex(-1); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen, close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusIndex(Math.max(0, options.findIndex((o) => o.value === value)));
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex((i) => (i + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < options.length) {
          onChange(options[focusIndex].value);
          close();
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`} onKeyDown={handleKeyDown}>
      {/* Toggle */}
      <button
        type="button"
        onClick={() => { setIsOpen((v) => !v); if (!isOpen) setFocusIndex(Math.max(0, options.findIndex((o) => o.value === value))); }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
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
        <div
          id={listId}
          role="listbox"
          aria-activedescendant={focusIndex >= 0 ? `${listId}-opt-${focusIndex}` : undefined}
          className="absolute top-full left-0 min-w-full w-max bg-surface border border-border border-t-0 rounded-b-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              id={`${listId}-opt-${i}`}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                close();
              }}
              onMouseEnter={() => setFocusIndex(i)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                opt.value === value
                  ? 'bg-primary-light text-primary font-medium'
                  : i === focusIndex
                    ? 'bg-interactive-hover text-text-primary'
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
