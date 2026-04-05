import type { Role } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  developer: '개발자',
  designer: '디자이너',
  planner: '기획자',
  'data-scientist': '데이터 사이언티스트',
};

export const APPLY_ROLES: Role[] = ['developer', 'designer', 'planner', 'data-scientist'];

export interface ApplyForm {
  intro: string;
  positions: Role[];
  techStack: string;
  portfolio: string;
}

export const EMPTY_APPLY_FORM: ApplyForm = { intro: '', positions: [], techStack: '', portfolio: '' };

export function buildDmContent(form: ApplyForm): string {
  const positions = form.positions.map((r) => ROLE_LABELS[r]).join(', ') || '미정';
  const parts = [
    `[자기소개]\n${form.intro}`,
    `[가능 포지션] ${positions}`,
  ];
  if (form.techStack.trim()) parts.push(`[기술스택] ${form.techStack}`);
  if (form.portfolio.trim()) parts.push(`[포트폴리오] ${form.portfolio}`);
  return parts.join('\n\n');
}
