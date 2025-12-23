import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('staff_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, priority, type, assignee, column_id, date } = req.body;
        const { data, error } = await supabase
            .from('staff_tasks')
            .insert([{ 
                title, 
                priority: priority || 'Medium', 
                type: type || 'General', 
                assignee: assignee || 'Unassigned', 
                column_id: column_id || 'idea', 
                date: date || new Date().toLocaleDateString() 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data ? data[0] : null);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const { data, error } = await supabase
            .from('staff_tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data ? data[0] : null);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('staff_tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
