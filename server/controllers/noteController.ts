import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';

export const getNotes = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('staff_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNote = async (req: Request, res: Response) => {
    try {
        const { text, color, rotation } = req.body;
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
        res.status(201).json(data ? data[0] : null);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('staff_notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Note deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
