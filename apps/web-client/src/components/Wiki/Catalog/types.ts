import type { LucideIcon } from 'lucide-react';
import { Sparkles, Flame, Skull, Heart, BookOpen } from 'lucide-react';
import type { WikiArticle } from '../../../services/wikiService';

export interface CategoryTab {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  activeBg: string;
  borderColor: string;
}

export const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'all',
    label: 'Todo el Compendio',
    icon: Sparkles,
    color: 'text-teal-400',
    activeBg: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-500/40',
  },
  {
    id: 'bosses',
    label: 'Jefes Supremos',
    icon: Flame,
    color: 'text-red-400',
    activeBg: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/40',
  },
  {
    id: 'mobs_hostiles',
    label: 'Mobs Hostiles',
    icon: Skull,
    color: 'text-purple-400',
    activeBg: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 'mobs_pacificos',
    label: 'Fauna & Mascotas',
    icon: Heart,
    color: 'text-emerald-400',
    activeBg: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'guias_generales',
    label: 'Guías del Servidor',
    icon: BookOpen,
    color: 'text-amber-400',
    activeBg: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/40',
  },
];

export interface CardVisuals {
  bgGradient: string;
  border: string;
  glow: string;
  badgeBg: string;
  accentColor: string;
  btnClass: string;
  tag: string;
  icon: LucideIcon;
}

export function getCardVisuals(article: WikiArticle): CardVisuals {
  if (article.category === 'bosses') {
    return {
      bgGradient: 'from-red-950/40 via-slate-900/80 to-black/90',
      border: 'border-red-500/20 hover:border-red-500/60',
      glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      accentColor: 'text-red-400',
      btnClass:
        'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 group-hover:border-red-500/60',
      tag: 'JEFE SUPREMO',
      icon: Flame,
    };
  }

  if (article.category === 'mobs_hostiles') {
    return {
      bgGradient: 'from-purple-950/40 via-slate-900/80 to-black/90',
      border: 'border-purple-500/20 hover:border-purple-500/60',
      glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      accentColor: 'text-purple-400',
      btnClass:
        'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30 group-hover:border-purple-500/60',
      tag: 'MOB HOSTIL',
      icon: Skull,
    };
  }

  if (article.category === 'mobs_pacificos') {
    return {
      bgGradient: 'from-emerald-950/40 via-slate-900/80 to-black/90',
      border: 'border-emerald-500/20 hover:border-emerald-500/60',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      accentColor: 'text-emerald-400',
      btnClass:
        'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 group-hover:border-emerald-500/60',
      tag: 'DOMESTICABLE',
      icon: Heart,
    };
  }

  return {
    bgGradient: 'from-teal-950/40 via-slate-900/80 to-black/90',
    border: 'border-teal-500/20 hover:border-teal-500/60',
    glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    accentColor: 'text-teal-400',
    btnClass:
      'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/30 group-hover:border-teal-500/60',
    tag: 'GUÍA OFICIAL',
    icon: BookOpen,
  };
}
