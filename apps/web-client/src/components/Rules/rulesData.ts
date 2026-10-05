import type { useTranslation } from 'react-i18next';
import type { Rule } from '../../services/ruleService';

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const DEFAULT_CATEGORY = 'General';
export const LANG_EN = 'en';
export const LANG_ES = 'es';

export const FIELD_TITLE = 'title';
export const FIELD_TITLE_EN = 'title_en';
export const FIELD_CONTENT = 'content';
export const FIELD_CONTENT_EN = 'content_en';

export type TranslationField =
  | typeof FIELD_TITLE
  | typeof FIELD_TITLE_EN
  | typeof FIELD_CONTENT
  | typeof FIELD_CONTENT_EN;

export type TranslateFn = ReturnType<typeof useTranslation>['t'];

export interface ProcessedRule extends Rule {
  globalIndex: number;
}

export interface RuleSeverity {
  label: string;
  color: string;
  class: string;
}

export interface RuleExamplesData {
  allowed: string;
  forbidden: string;
}

export const UI_CLASSES = {
  label: 'text-[10px] font-black uppercase tracking-widest text-gray-500',
  input:
    'focus:border-(--accent) rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none',
  textarea:
    'focus:border-(--accent) resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none',
  translateBtn:
    'bg-(--accent)/10 text-(--accent) border-(--accent)/20 hover:bg-(--accent) rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-black disabled:opacity-50',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  General: '#6366f1',
  Comportamiento: '#f87171',
  Chat: '#4ade80',
  PvP: '#fb923c',
  Construcción: '#2dd4bf',
  Modificaciones: '#a78bfa',
  Staff: '#f472b6',
  Seguridad: '#10b981',
  Contenido: '#fcd34d',
  Economía: '#34d399',
  Mundo: '#60a5fa',
  Cuenta: '#94a3b8',
  Discord: '#5865F2',
  Estética: '#f472b6',
  Comunidad: '#fb7185',
};

export const DEFAULT_CATEGORY_COLOR = '#94a3b8';

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
};

export const INITIAL_FORM_DATA: Partial<Rule> = {
  category: DEFAULT_CATEGORY,
  title: '',
  title_en: '',
  content: '',
  content_en: '',
  color: '',
  sort_order: 0,
};

export const getRuleSeverity = (category: string, title: string, t: TranslateFn): RuleSeverity => {
  const cat = (category || '').toLowerCase();
  const ttl = title.toLowerCase();

  const isCritical =
    cat === 'seguridad' ||
    cat === 'security' ||
    ttl.includes('hack') ||
    ttl.includes('dupe') ||
    ttl.includes('exploit') ||
    ttl.includes('robo') ||
    ttl.includes('cuenta');

  if (isCritical) {
    return {
      label: t('rules.severity.critical', 'Crítica'),
      color: '#ef4444',
      class: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
  }

  const isSerious =
    cat === 'pvp' ||
    cat === 'construcción' ||
    cat === 'building' ||
    ttl.includes('grifo') ||
    ttl.includes('grief') ||
    ttl.includes('insulto') ||
    ttl.includes('comportamiento');

  if (isSerious) {
    return {
      label: t('rules.severity.serious', 'Grave'),
      color: '#f97316',
      class: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
  }

  return {
    label: t('rules.severity.mild', 'Leve'),
    color: '#10b981',
    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
};

export const RULE_EXAMPLES_DICT: Record<string, { es: RuleExamplesData; en: RuleExamplesData }> = {
  chat: {
    en: {
      allowed: 'Greeting, respectful debate, trading via global chat, and wholesome jokes.',
      forbidden:
        'Spam, insults, toxicity, sharing unauthorized links, discrimination, or excessive caps.',
    },
    es: {
      allowed:
        'Saludar, debatir con respeto, comerciar por el chat global y compartir chistes sanos.',
      forbidden:
        'Spam, insultos, toxicidad, compartir enlaces no autorizados, discriminación o mayúsculas excesivas.',
    },
  },
  pvp: {
    en: {
      allowed: 'Fighting in designated zones, declaring formal clan wars.',
      forbidden: 'Spawnkilling, combat logging, or lava trapping.',
    },
    es: {
      allowed: 'Pelear en zonas habilitadas, declarar guerras formales bajo el sistema de clanes.',
      forbidden:
        'Matar reiteradamente en puntos de aparición (spawnkill), usar desconexión en combate o trampas de lava.',
    },
  },
  construcción: {
    en: {
      allowed:
        'Creating claims, building towns with friends, decorating public pathways aesthetically.',
      forbidden:
        'Griefing, constructing ugly floating structures, blocking access for other players.',
    },
    es: {
      allowed:
        'Crear reclamos (claims), edificar ciudades con amigos, decorar caminos públicos de forma estética.',
      forbidden:
        'Griefing (destrucción), construir estructuras flotantes sin estética, tapar accesos de otros jugadores.',
    },
  },
  building: {
    en: {
      allowed:
        'Creating claims, building towns with friends, decorating public pathways aesthetically.',
      forbidden:
        'Griefing, constructing ugly floating structures, blocking access for other players.',
    },
    es: {
      allowed:
        'Crear reclamos (claims), edificar ciudades con amigos, decorar caminos públicos de forma estética.',
      forbidden:
        'Griefing (destrucción), construir estructuras flotantes sin estética, tapar accesos de otros jugadores.',
    },
  },
  seguridad: {
    en: {
      allowed: 'Reporting bugs and exploits in Discord private support channel.',
      forbidden:
        'Using hacks, dupes, exploiting bugs, sharing accounts, or stealing unprotected chests.',
    },
    es: {
      allowed: 'Reportar fallos y exploits en el canal de soporte privado de Discord.',
      forbidden:
        'Uso de hacks, dupes, aprovechamiento de bugs, compartir cuentas personales o robo de cofres desprotegidos.',
    },
  },
  security: {
    en: {
      allowed: 'Reporting bugs and exploits in Discord private support channel.',
      forbidden:
        'Using hacks, dupes, exploiting bugs, sharing accounts, or stealing unprotected chests.',
    },
    es: {
      allowed: 'Reportar fallos y exploits en el canal de soporte privado de Discord.',
      forbidden:
        'Uso de hacks, dupes, aprovechamiento de bugs, compartir cuentas personales o robo de cofres desprotegidos.',
    },
  },
};

export const DEFAULT_RULE_EXAMPLES: { es: RuleExamplesData; en: RuleExamplesData } = {
  en: {
    allowed: 'Play fairly, respect staff instructions, and enjoy the CrystalTides experience.',
    forbidden: 'Evading punishments using alt accounts, abusing game mechanics to harass others.',
  },
  es: {
    allowed:
      'Jugar justamente, respetar las indicaciones del staff y disfrutar de la experiencia CrystalTides.',
    forbidden:
      'Intentar evadir sanciones mediante multicuentas, abusar de mecánicas del juego para molestar a otros.',
  },
};

export const getRuleExamples = (
  category: string,
  _title: string,
  lang: string = LANG_ES,
): RuleExamplesData => {
  const cat = (category || '').toLowerCase();
  const entry = RULE_EXAMPLES_DICT[cat] || DEFAULT_RULE_EXAMPLES;
  return lang === LANG_EN ? entry.en : entry.es;
};

export const getRuleCommands = (category: string): string[] => {
  const cat = (category || '').toLowerCase().trim();
  if (cat === 'chat') {
    return ['/ignore <jugador>', '/msg <jugador>', '/report <jugador>'];
  }
  if (cat === 'pvp' || cat === 'combate') {
    return ['/duelo retar <jugador>', '/duelo aceptar', '/pvp toggle'];
  }
  if (cat === 'construcción' || cat === 'construccion' || cat === 'building' || cat === 'claims') {
    return ['/lands claim', '/trust <jugador>'];
  }
  if (cat === 'seguridad' || cat === 'security' || cat === 'cuenta') {
    return ['/link <code>', '/unlink', '/report <jugador>'];
  }
  if (cat === 'economía' || cat === 'economia' || cat === 'economy') {
    return ['/money', '/bal', '/banco'];
  }
  return ['/help', '/rules', '/report <jugador>'];
};
