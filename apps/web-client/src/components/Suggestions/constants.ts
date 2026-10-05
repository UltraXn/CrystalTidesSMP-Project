import type { SuggestionItem } from './types';

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const DEFAULT_AVATAR = 'https://mc-heads.net/avatar/Steeve/64';
export const SELECT_OPTION_CLASS = 'bg-[#0a0a0a]';
export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const QUERY_KEYS = {
  ACTIVE_POLL: ['activePoll'] as const,
  SUGGESTIONS: ['suggestions'] as const,
};

// Seed Suggestions in case database is empty or offline
export const SEED_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'seed-1',
    nickname: 'pixiesixer',
    type: 'General',
    message:
      'Sería genial tener un mercado de agricultores en el spawn los domingos donde podamos vender cultivos por CrystalCoins.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 34,
    downvotes: 3,
  },
  {
    id: 'seed-2',
    nickname: 'Zeta',
    type: 'Mod',
    message:
      'Propongo agregar el mod de decoración "Supplementaries" para darle más vida a nuestras construcciones medievales.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    upvotes: 56,
    downvotes: 4,
  },
  {
    id: 'seed-3',
    nickname: 'Neroferno',
    type: 'Bug',
    message:
      'El comando /spawn a veces te teletransporta un bloque por debajo del suelo y sufres daño por sofocación.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    upvotes: 18,
    downvotes: 1,
  },
];
