import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

const handleTaskError = (res: Response, error: unknown) => {
  console.error('[TaskController] Internal error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleTaskError(res, error);
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, priority, type, assignee, column_id, date, due_date, end_date } = req.body;
    const { data, error } = await supabase
      .from('staff_tasks')
      .insert([
        {
          title,
          priority: priority || 'Medium',
          type: type || 'General',
          assignee: assignee || 'Unassigned',
          column_id: column_id || 'idea',
          date: date || new Date().toLocaleDateString(),
          due_date: due_date || null,
          end_date: end_date || null,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data ? data[0] : null);
  } catch (error) {
    handleTaskError(res, error);
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const updates = req.body;

    const { data, error } = await supabase
      .from('staff_tasks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase Update Error:', error);
      throw error;
    }
    res.json(data ? data[0] : null);
  } catch (error) {
    console.error('Server Task Update Error:', error);
    handleTaskError(res, error);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { error } = await supabase.from('staff_tasks').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    handleTaskError(res, error);
  }
};
