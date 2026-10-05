import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export interface MemberCard {
  name: string;
  role: string;
  image?: string;
  mc_nickname?: string;
  avatar?: string;
  rankBadge?: string;
  color: string;
  desc: string;
}

export interface FeatureItem {
  imageSrc?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badgeText: string;
  brandColor?: string;
  videoUrl?: string;
}

export interface StageFloatingItem {
  src?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  color?: string;
  pos: string;
  size: string;
  duration: number;
  rotateX: number[];
  rotateZ: number[];
  y: number[];
}

export interface TimelineItem {
  title: string;
  date: string;
  description: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  features?: string[];
}

export interface Stage {
  id: number;
  year: string;
  stageName: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  imageSrc?: string;
  narrativeSummary: string;
  members?: MemberCard[];
  features?: FeatureItem[];
  timeline?: TimelineItem[];
}

export type StageData = Stage;

export interface MemberConfigItem {
  name: string;
  xEnd: string;
  color: string;
  role: string;
}
