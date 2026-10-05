import React from 'react';
import {
  Info,
  ShieldAlert,
  MessageSquare,
  Swords,
  Hammer,
  Cpu,
  Sparkles,
  Lock,
  Compass,
  Coins,
  Globe,
  UserCheck,
  Disc as DiscordIcon,
  Palette,
  Heart,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

const CATEGORY_ICON_LOOKUP: Record<string, LucideIcon> = {
  general: Info,
  comportamiento: ShieldAlert,
  chat: MessageSquare,
  pvp: Swords,
  construcción: Hammer,
  construccion: Hammer,
  building: Hammer,
  modificaciones: Cpu,
  staff: Sparkles,
  seguridad: Lock,
  security: Lock,
  contenido: Compass,
  economía: Coins,
  economia: Coins,
  economy: Coins,
  mundo: Globe,
  cuenta: UserCheck,
  discord: DiscordIcon,
  estética: Palette,
  estetica: Palette,
  comunidad: Heart,
};

export const CategoryIcon: React.FC<Readonly<CategoryIconProps>> = ({
  category,
  size = 18,
  className,
}) => {
  const cat = (category || '').toLowerCase().trim();
  const IconComponent = CATEGORY_ICON_LOOKUP[cat] || HelpCircle;

  return <IconComponent size={size} className={className} />;
};
