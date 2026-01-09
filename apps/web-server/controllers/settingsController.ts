import supabase from '../config/supabaseClient.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';
import { Request, Response } from 'express';

// Configuración pública permitida para usuarios no autenticados
const PUBLIC_SETTINGS_WHITELIST = [
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
];

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
                if (isAdmin || PUBLIC_SETTINGS_WHITELIST.includes(item.key)) {
                    settings[item.key] = item.value;
                }
            });
        }

        res.json(settings);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[Settings Controller Error]:", message);
        res.status(500).json({ error: message });
    }
};

// Obtener una configuración específica
export const getSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        const isAdmin = req.user && ['admin', 'neroferno', 'killu', 'killuwu', 'developer'].includes(req.user.role);

        if (!data) return res.json(null);

        if (!isAdmin && !PUBLIC_SETTINGS_WHITELIST.includes(key)) {
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
        const { key } = req.params;
        const { value, username, userId } = req.body; // userId y username para logs

        let finalValue = value;

        // Auto Translation for Staff Cards
        if (key === 'staff_cards') {
            try {
                const cards = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(cards)) {
                    const translatedCards = await Promise.all(cards.map(async (card: { role?: string, role_en?: string, description?: string, description_en?: string }) => ({
                        ...card,
                        role_en: card.role ? await translateText(card.role, 'en').catch(() => card.role_en) : card.role_en,
                        description_en: card.description ? await translateText(card.description, 'en').catch(() => card.description_en) : card.description_en
                    })));
                    finalValue = JSON.stringify(translatedCards);
                }
            } catch (err) {
                console.error("Error translating staff cards:", err);
            }
        }

        // Auto Translation for Donors List
        if (key === 'donors_list') {
            try {
                const donors = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(donors)) {
                    const translatedDonors = await Promise.all(donors.map(async (donor: { description?: string, description_en?: string }) => ({
                        ...donor,
                        description_en: donor.description_en
                        // description_en: donor.description ? await translateText(donor.description, 'en') : donor.description_en
                    })));
                    finalValue = JSON.stringify(translatedDonors);
                }
            } catch (err) {
                console.error("Error translating donors list:", err);
            }
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
