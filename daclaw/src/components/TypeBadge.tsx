import type { HackathonType } from '@/types';

const TYPE_CONFIG: Record<HackathonType, { label: string; cls: string; solidCls: string; barCls: string }> = {
  quantitative: {
    label: '정량',
    cls: 'bg-type-quantitative-light text-type-quantitative',
    solidCls: 'bg-type-quantitative/90 text-text-on-primary',
    barCls: 'bg-type-quantitative',
  },
  qualitative: {
    label: '정성',
    cls: 'bg-type-qualitative-light text-type-qualitative',
    solidCls: 'bg-type-qualitative/90 text-text-on-primary',
    barCls: 'bg-type-qualitative',
  },
  hybrid: {
    label: '혼합',
    cls: 'bg-type-hybrid-light text-type-hybrid',
    solidCls: 'bg-type-hybrid/90 text-text-on-primary',
    barCls: 'bg-type-hybrid',
  },
};

interface TypeBadgeProps {
  type: HackathonType;
  variant?: 'light' | 'solid';
  className?: string;
  fullLabel?: boolean;
}

export default function TypeBadge({ type, variant = 'light', className = '', fullLabel = false }: TypeBadgeProps) {
  const cfg = TYPE_CONFIG[type];
  const base = variant === 'solid' ? cfg.solidCls : cfg.cls;
  const label = fullLabel
    ? (type === 'quantitative' ? '정량 평가' : type === 'qualitative' ? '정성 평가' : '혼합 평가')
    : cfg.label;

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${base} ${className}`}>
      {label}
    </span>
  );
}

export function getTypeBarClass(type: HackathonType): string {
  return TYPE_CONFIG[type].barCls;
}
