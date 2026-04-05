'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import Modal from '@/components/Modal';
import { ROLE_LABELS, APPLY_ROLES, EMPTY_APPLY_FORM, buildDmContent } from '@/lib/constants';
import type { ApplyForm } from '@/lib/constants';
import type { Role } from '@/types';

interface ApplyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  onSend: (content: string) => void;
}

export default function ApplyFormModal({ isOpen, onClose, teamName, onSend }: ApplyFormModalProps) {
  const [form, setForm] = useState<ApplyForm>(EMPTY_APPLY_FORM);

  function togglePosition(role: Role) {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(role)
        ? prev.positions.filter((r) => r !== role)
        : [...prev.positions, role],
    }));
  }

  function handleSubmit() {
    if (!form.intro.trim()) return;
    onSend(buildDmContent(form));
    setForm(EMPTY_APPLY_FORM);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <h2 className="text-lg font-bold text-text-primary mb-4">참가 신청 — {teamName}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">
            자기소개 <span className="text-error text-xs">*</span>
          </label>
          <textarea
            value={form.intro}
            onChange={(e) => setForm({ ...form, intro: e.target.value })}
            placeholder="자기소개와 참가 동기를 작성해주세요..."
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">가능 포지션</label>
          <div className="flex flex-wrap gap-2">
            {APPLY_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => togglePosition(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  form.positions.includes(r)
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-primary-light'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">기술스택</label>
          <input
            type="text"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            placeholder="React, Python, Figma ... (쉼표로 구분)"
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            포트폴리오 링크 <span className="text-text-secondary text-xs">(선택)</span>
          </label>
          <input
            type="url"
            value={form.portfolio}
            onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
            placeholder="https://..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!form.intro.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          <Send size={16} /> 신청 보내기
        </button>
      </div>
    </Modal>
  );
}
