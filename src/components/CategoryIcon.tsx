import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  BookOpen,
  CircleEllipsis,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  PiggyBank,
  Coffee,
  Plane,
  ShieldCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { getCategoryMeta } from '../utils/formatters';

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
  showBg?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  BookOpen,
  CircleEllipsis,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  PiggyBank,
  Coffee,
  Plane,
  ShieldCheck,
  Tag,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = '',
  size = 18,
  showBg = true,
}) => {
  const meta = getCategoryMeta(category);
  const IconComponent = ICON_MAP[meta.icon] || Tag || AlertCircle;

  if (!showBg) {
    return (
      <span style={{ color: meta.color }} className={`inline-flex items-center justify-center ${className}`}>
        <IconComponent size={size} />
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl transition-transform ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
        width: `${size * 2}px`,
        height: `${size * 2}px`,
      }}
    >
      <IconComponent size={size} />
    </div>
  );
};
