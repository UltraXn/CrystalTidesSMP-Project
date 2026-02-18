import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';
import * as logService from '../services/logService.js';

export const getNotes = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('staff_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const createNote = async (req: Request, res: Response) => {
    try {
        const { text, color, rotation } = req.body;
        const user = (req as Request & { user?: { id?: string; username?: string } }).user;
        const { data, error } = await supabase
            .from('staff_notes')
            .insert([{ 
                text, 
                color: color || '#fef3c7', 
                rotation: rotation || 0,
                date: new Date().toLocaleDateString()
            }])
            .select();

        if (error) throw error;
        await logService.createLog({
            user_id: user?.id,
            username: user?.username || 'Staff',
            action: 'STAFF_NOTE_CREATE',
            details: {
                note_id: data?.[0]?.id,
                text
            },
            source: 'web'
        });
        res.status(201).json(data ? data[0] : null);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as Request & { user?: { id?: string; username?: string } }).user;

        const { data: existingNote } = await supabase
            .from('staff_notes')
            .select('id, text')
            .eq('id', id)
            .maybeSingle();

        const { error } = await supabase
            .from('staff_notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await logService.createLog({
            user_id: user?.id,
            username: user?.username || 'Staff',
            action: 'STAFF_NOTE_DELETE',
            details: {
                note_id: id,
                note: existingNote || null
            },
            source: 'web'
        });
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
