import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';
import * as logService from '../services/logService.js';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('staff_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, priority, type, assignee, column_id, date, due_date, end_date } = req.body;
        const user = (req as Request & { user?: { id?: string; username?: string } }).user;
        const { data, error } = await supabase
            .from('staff_tasks')
            .insert([{ 
                title, 
                priority: priority || 'Medium', 
                type: type || 'General', 
                assignee: assignee || 'Unassigned', 
                column_id: column_id || 'idea', 
                date: date || new Date().toLocaleDateString(),
                due_date: due_date || null,
                end_date: end_date || null
            }])
            .select();

        if (error) throw error;
        await logService.createLog({
            user_id: user?.id,
            username: user?.username || 'Staff',
            action: 'STAFF_TASK_CREATE',
            details: {
                task_id: data?.[0]?.id,
                title,
                column_id: column_id || 'idea',
                priority: priority || 'Medium',
                type: type || 'General',
                assignee: assignee || 'Unassigned'
            },
            source: 'web'
        });
        res.status(201).json(data ? data[0] : null);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = (req as Request & { user?: { id?: string; username?: string } }).user;
        
        const { data, error } = await supabase
            .from('staff_tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("Supabase Update Error:", error);
            throw error;
        }
        await logService.createLog({
            user_id: user?.id,
            username: user?.username || 'Staff',
            action: 'STAFF_TASK_UPDATE',
            details: {
                task_id: id,
                updates
            },
            source: 'web'
        });
        res.json(data ? data[0] : null);
    } catch (error) {
        console.error("Server Task Update Error:", error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message, details: "Verifica que las columnas (column_id, due_date) existan en la tabla staff_tasks" });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as Request & { user?: { id?: string; username?: string } }).user;

        const { data: existingTask } = await supabase
            .from('staff_tasks')
            .select('id, title, column_id, assignee')
            .eq('id', id)
            .maybeSingle();

        const { error } = await supabase
            .from('staff_tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await logService.createLog({
            user_id: user?.id,
            username: user?.username || 'Staff',
            action: 'STAFF_TASK_DELETE',
            details: {
                task_id: id,
                task: existingTask || null
            },
            source: 'web'
        });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
