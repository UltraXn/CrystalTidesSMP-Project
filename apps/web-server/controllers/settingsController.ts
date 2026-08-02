import supabase from '../config/supabaseClient.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

// Configuración pública permitida para usuarios no autenticados
const PUBLIC_SETTINGS_WHITELIST = new Set([
    'maintenance_mode',
    'theme',
    'hero_banners',
    'hero_slides',
    'staff_cards',
    'broadcasts',
    'server_rules',
    'donors_list',
    'last_donors',
    'medal_definitions',
    'achievement_definitions'
]);

const translateStaffCards = async (value: unknown): Promise<unknown> => {
    try {
        const cards = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(cards)) return value;
        const translatedCards = await Promise.all(cards.map(async (card: { role?: string, role_en?: string, description?: string, description_en?: string }) => ({
            ...card,
            role_en: card.role ? await translateText(card.role, 'en').catch(() => card.role_en) : card.role_en,
            description_en: card.description ? await translateText(card.description, 'en').catch(() => card.description_en) : card.description_en
        })));
        return JSON.stringify(translatedCards);
    } catch (err) {
        console.error("Error translating staff cards:", err);
        return value;
    }
};

const translateDonorsList = (value: unknown): unknown => {
    try {
        const donors = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(donors)) return value;
        const translatedDonors = donors.map((donor: { description?: string, description_en?: string }) => ({
            ...donor,
            description_en: donor.description_en
        }));
        return JSON.stringify(translatedDonors);
    } catch (err) {
        console.error("Error translating donors list:", err);
        return value;
    }
};

// Obtener todas las configuraciones
export const getSettings = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) {
            // Manejar caso de tabla no existente (PostgREST error code: PGRST116 or similar)
            if (error.code === 'PGRST116' || error.message.includes('not found')) {
                console.warn("[Settings] 'site_settings' table not found in Supabase.");
                return res.json({});
            }
            throw error;
        }

        const isAdmin = req.user && ['admin', 'neroferno', 'killu', 'killuwu', 'developer'].includes(req.user.role);

        // Convertir array a objeto y filtrar si no es admin
        const settings: Record<string, unknown> = {};
        if (data) {
            data.forEach((item: { key: string, value: unknown }) => {
                if (isAdmin || PUBLIC_SETTINGS_WHITELIST.has(item.key)) {
                    settings[item.key] = item.value;
                }
            });
        }

        res.json(settings);
    } catch (error: unknown) {
        console.error("[Settings Controller CRITICAL 500]:", error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ 
            error: "Internal Server Error loading settings",
            details: message,
            timestamp: new Date().toISOString()
        });
    }
};

// Obtener una configuración específica
export const getSetting = async (req: Request, res: Response) => {
    try {
        const key = ensureString(req.params.key);
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        const isAdmin = req.user && ['admin', 'neroferno', 'killu', 'killuwu', 'developer'].includes(req.user.role);

        if (!data) return res.json(null);

        if (!isAdmin && !PUBLIC_SETTINGS_WHITELIST.has(key)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

// Actualizar una configuración
export const updateSetting = async (req: Request, res: Response) => {
    try {
        const key = ensureString(req.params.key);
        const { value, username, userId } = req.body; // userId y username para logs

        let finalValue = value;

        if (key === 'staff_cards') {
            finalValue = await translateStaffCards(value);
        } else if (key === 'donors_list') {
            finalValue = translateDonorsList(value);
        }

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ 
                key,
                value: finalValue, 
                updated_at: new Date(),
                updated_by: userId || null 
            })
            .select();

        if (error) throw error;

        // Log de auditoría
        await logService.createLog({
            user_id: userId || null,
            username: username || 'Admin',
            action: 'UPDATE_SETTING',
            details: `Changed config '${key}' to '${value}'`,
            source: 'web'
        });

        res.json(data ? data[0] : null);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
