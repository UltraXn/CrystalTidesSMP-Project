import supabase from '../config/supabaseClient.js';
import * as logService from '../services/logService.js';
import { Request, Response } from 'express';

// Obtener todas las configuraciones
export const getSettings = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convertir array [{key: 'theme', value: 'default'}] a objeto { theme: 'default' }
        const settings: any = {};
        if (data) {
            data.forEach((item: any) => {
                settings[item.key] = item.value;
            });
        }

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una configuración
export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const { value, username, userId } = req.body; // userId y username para logs

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ 
                key,
                value, 
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
