import type { HackathonStatus } from '@/types';

const STATUS_CONFIG: Record<HackathonStatus, { label: string; cls: string }> = {
  active: { label: '진행중', cls: 'bg-success-light text-success' },
  upcoming: { label: '예정', cls: 'bg-info-light text-info' },
  ended: { label: '종료', cls: 'bg-background text-text-secondary' },
};

interface StatusBadgeProps {
  status: HackathonStatus;
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({ status, pulse = false, className = '' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls} ${className}`}>
      {pulse && status === 'active' && (
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      )}
      {cfg.label}
    </span>
  );
}
