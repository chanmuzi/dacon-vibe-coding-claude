import {
  Target, Crown, Trophy, Star, Flame, Tent, Palette, FlaskConical,
  MessageSquare, Sprout, Swords, Gem, Code2, ClipboardList, BarChart3,
  Medal, Award,
  type LucideProps,
} from 'lucide-react';
import { type ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Target,
  Crown,
  Trophy,
  Star,
  Flame,
  Tent,
  Palette,
  FlaskConical,
  MessageSquare,
  Sprout,
  Swords,
  Gem,
  Code2,
  ClipboardList,
  BarChart3,
  Medal,
  Award,
};

interface IconMapperProps {
  name: string;
  size?: number;
  className?: string;
}

export default function IconMapper({ name, size = 16, className }: IconMapperProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span className={className}>?</span>;
  return <Icon size={size} className={className} />;
}
