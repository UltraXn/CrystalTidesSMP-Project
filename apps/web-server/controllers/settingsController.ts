import supabase from '../config/supabaseClient.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

// Table and Locales Constants
export const SETTINGS_TABLE = 'site_settings';
const DEFAULT_LOCALE = 'en';
const DEFAULT_ADMIN_USERNAME = 'Admin';
const AUDIT_ACTION_UPDATE = 'UPDATE_SETTING';
const AUDIT_SOURCE_WEB = 'web';
const POSTGREST_NOT_FOUND_CODE = 'PGRST116';

// Setting Keys Constants
export const SETTING_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  THEME: 'theme',
  HERO_BANNERS: 'hero_banners',
  HERO_SLIDES: 'hero_slides',
  STAFF_CARDS: 'staff_cards',
  BROADCASTS: 'broadcasts',
  SERVER_RULES: 'server_rules',
  DONORS_LIST: 'donors_list',
  LAST_DONORS: 'last_donors',
  MEDAL_DEFINITIONS: 'medal_definitions',
  ACHIEVEMENT_DEFINITIONS: 'achievement_definitions',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

// Public Settings Whitelist for unauthenticated users
const PUBLIC_SETTINGS_WHITELIST: ReadonlySet<string> = new Set([
  SETTING_KEYS.MAINTENANCE_MODE,
  SETTING_KEYS.THEME,
  SETTING_KEYS.HERO_BANNERS,
  SETTING_KEYS.HERO_SLIDES,
  SETTING_KEYS.STAFF_CARDS,
  SETTING_KEYS.BROADCASTS,
  SETTING_KEYS.SERVER_RULES,
  SETTING_KEYS.DONORS_LIST,
  SETTING_KEYS.LAST_DONORS,
  SETTING_KEYS.MEDAL_DEFINITIONS,
  SETTING_KEYS.ACHIEVEMENT_DEFINITIONS,
]);

// Administrative roles permitted to access all settings
const ADMIN_ROLES: ReadonlySet<string> = new Set([
  'admin',
  'neroferno',
  'killu',
  'killuwu',
  'developer',
]);

interface StaffCard {
  role?: string;
  role_en?: string;
  description?: string;
  description_en?: string;
  [key: string]: unknown;
}

interface Donor {
  description?: string;
  description_en?: string;
  [key: string]: unknown;
}

interface SiteSettingRecord {
  key: string;
  value: unknown;
  updated_at?: string | Date;
  updated_by?: string | null;
}

interface PostgrestErrorLike {
  code?: string;
  message?: string;
}

type SettingTransformer = (value: unknown) => unknown;

/**
 * Determines whether the user possesses administrative privileges.
 */
function isUserAdmin(user: Request['user']): boolean {
  if (!user?.role) {
    return false;
  }
  const role = user.role.toLowerCase();
  return ADMIN_ROLES.has(role);
}

/**
 * Extracts a normalized error message string from an unknown error.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely parses a JSON string or returns the value if already an array.
 * Throws SyntaxError on malformed JSON strings so caller try/catch can handle it.
 */
function parseJsonArray<T>(value: unknown): T[] | null {
  const raw = typeof value === 'string' ? JSON.parse(value) : value;
  if (Array.isArray(raw)) {
    return raw as T[];
  }
  return null;
}

/**
 * Safely translates a single text field with graceful fallback.
 */
async function translateField(
  text: string | undefined,
  fallback: string | undefined,
): Promise<string | undefined> {
  if (!text) {
    return fallback;
  }
  try {
    return await translateText(text, DEFAULT_LOCALE);
  } catch {
    return fallback;
  }
}

/**
 * Translates localized fields of a staff card.
 */
async function translateCard(card: StaffCard): Promise<StaffCard> {
  const role_en = await translateField(card.role, card.role_en);
  const description_en = await translateField(card.description, card.description_en);
  return {
    ...card,
    role_en,
    description_en,
  };
}

const translateStaffCards = async (value: unknown): Promise<unknown> => {
  try {
    const cards = parseJsonArray<StaffCard>(value);
    if (!cards) {
      return value;
    }
    const translatedCards = await Promise.all(cards.map(translateCard));
    return JSON.stringify(translatedCards);
  } catch (err) {
    console.error('Error translating staff cards:', err);
    return value;
  }
};

const translateDonorsList = (value: unknown): unknown => {
  try {
    const donors = parseJsonArray<Donor>(value);
    if (!donors) {
      return value;
    }
    const translatedDonors = donors.map((donor: Donor) => ({
      ...donor,
      description_en: donor.description_en,
    }));
    return JSON.stringify(translatedDonors);
  } catch (err) {
    console.error('Error translating donors list:', err);
    return value;
  }
};

/**
 * Lookup dictionary for setting-specific value transformers.
 */
const SETTING_TRANSFORMERS: Record<string, SettingTransformer> = {
  [SETTING_KEYS.STAFF_CARDS]: translateStaffCards,
  [SETTING_KEYS.DONORS_LIST]: translateDonorsList,
};

/**
 * Applies setting transformation if a transformer is registered for the key.
 */
async function transformSettingValue(key: string, value: unknown): Promise<unknown> {
  const transformer = SETTING_TRANSFORMERS[key];
  if (transformer) {
    return await transformer(value);
  }
  return value;
}

/**
 * Checks whether an error signifies that the table does not exist.
 */
function isTableNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const pgError = error as PostgrestErrorLike;
  const isCodeMatch = pgError.code === POSTGREST_NOT_FOUND_CODE;
  const isMessageMatch = Boolean(pgError.message?.includes('not found'));
  return isCodeMatch || isMessageMatch;
}

/**
 * Filters site settings based on user admin privileges and public whitelist.
 */
function filterSettings(
  data: SiteSettingRecord[] | null,
  isAdmin: boolean,
): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (!data) {
    return settings;
  }

  for (const item of data) {
    if (isAdmin || PUBLIC_SETTINGS_WHITELIST.has(item.key)) {
      settings[item.key] = item.value;
    }
  }

  return settings;
}

// Obtener todas las configuraciones
export const getSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from(SETTINGS_TABLE).select('*');

    if (error) {
      // Manejar caso de tabla no existente (PostgREST error code: PGRST116 or similar)
      if (isTableNotFoundError(error)) {
        console.warn(`[Settings] '${SETTINGS_TABLE}' table not found in Supabase.`);
        return res.json({});
      }
      throw error;
    }

    const isAdmin = isUserAdmin(req.user);
    const settings = filterSettings(data as SiteSettingRecord[] | null, isAdmin);

    return res.json(settings);
  } catch (error: unknown) {
    console.error('[Settings Controller CRITICAL 500]:', error);
    return res.status(500).json({
      error: 'Internal Server Error loading settings',
      details: getErrorMessage(error),
      timestamp: new Date().toISOString(),
    });
  }
};

// Obtener una configuración específica
export const getSetting = async (req: Request, res: Response) => {
  try {
    const key = ensureString(req.params.key);
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const isAdmin = isUserAdmin(req.user);

    if (!data) {
      return res.json(null);
    }

    if (!isAdmin && !PUBLIC_SETTINGS_WHITELIST.has(key)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(data);
  } catch (error: unknown) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// Actualizar una configuración
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const key = ensureString(req.params.key);
    const { value, username, userId } = req.body; // userId y username para logs

    const finalValue = await transformSettingValue(key, value);

    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        key,
        value: finalValue,
        updated_at: new Date(),
        updated_by: userId || null,
      })
      .select();

    if (error) {
      throw error;
    }

    // Log de auditoría
    await logService.createLog({
      user_id: userId || null,
      username: username || DEFAULT_ADMIN_USERNAME,
      action: AUDIT_ACTION_UPDATE,
      details: `Changed config '${key}' to '${value}'`,
      source: AUDIT_SOURCE_WEB,
    });

    const updatedRecord = Array.isArray(data) && data.length > 0 ? data[0] : null;
    return res.json(updatedRecord);
  } catch (error: unknown) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
