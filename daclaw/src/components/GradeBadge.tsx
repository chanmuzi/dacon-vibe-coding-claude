import { gradeConfig } from '@/data/seed';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md';
}

const ELITE_GRADIENTS: Record<string, { bg: string; shadow: string }> = {
  legend: {
    bg: 'linear-gradient(135deg, #DC2626, #F87171)',
    shadow: '0 0 8px rgba(220, 38, 38, 0.35)',
  },
  challenger: {
    bg: 'linear-gradient(135deg, #2563EB, #60A5FA)',
    shadow: '0 0 8px rgba(37, 99, 235, 0.3)',
  },
};

export default function GradeBadge({ grade, size = 'sm' }: GradeBadgeProps) {
  const cfg = gradeConfig[grade];
  if (!cfg) return null;

  const isSmall = size === 'sm';
  const elite = ELITE_GRADIENTS[grade];
  const titleText = `${cfg.label} (${cfg.min.toLocaleString()}${cfg.max === Infinity ? '+' : '~' + cfg.max.toLocaleString()} pt)`;

  const sizeClasses = isSmall ? 'px-1 py-px text-[10px] leading-tight' : 'px-1.5 py-0.5 text-xs';

  if (elite) {
    return (
      <span
        className={`inline-flex items-center font-bold border rounded shrink-0 text-white ${sizeClasses}`}
        style={{
          background: elite.bg,
          borderColor: 'transparent',
          boxShadow: elite.shadow,
        }}
        title={titleText}
      >
        {cfg.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold border rounded shrink-0 ${sizeClasses}`}
      style={{
        color: cfg.color,
        borderColor: cfg.color,
        backgroundColor: `color-mix(in srgb, ${cfg.color} ${grade === 'expert' ? '15' : '10'}%, transparent)`,
      }}
      title={titleText}
    >
      {cfg.label}
    </span>
  );
}
