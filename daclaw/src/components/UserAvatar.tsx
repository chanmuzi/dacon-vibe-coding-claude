import { Code2, Palette, ClipboardList, BarChart3, type LucideProps } from 'lucide-react';
import type { Role } from '@/types';
import { type ComponentType } from 'react';

const ROLE_CONFIG: Record<Role, { icon: ComponentType<LucideProps>; bg: string; text: string }> = {
  developer: { icon: Code2, bg: 'bg-role-developer', text: 'text-role-developer' },
  designer: { icon: Palette, bg: 'bg-role-designer', text: 'text-role-designer' },
  planner: { icon: ClipboardList, bg: 'bg-role-planner', text: 'text-role-planner' },
  'data-scientist': { icon: BarChart3, bg: 'bg-role-data-scientist', text: 'text-role-data-scientist' },
};

const SIZE_CONFIG = {
  sm: { container: 'w-6 h-6', icon: 12 },
  md: { container: 'w-8 h-8', icon: 16 },
  lg: { container: 'w-10 h-10', icon: 20 },
} as const;

interface UserAvatarProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ role, size = 'md', className = '' }: UserAvatarProps) {
  const cfg = ROLE_CONFIG[role];
  const sz = SIZE_CONFIG[size];
  const Icon = cfg.icon;

  return (
    <div
      className={`${sz.container} rounded-full ${cfg.bg} flex items-center justify-center shrink-0 ${className}`}
      title={role}
    >
      <Icon size={sz.icon} className="text-white" />
    </div>
  );
}
