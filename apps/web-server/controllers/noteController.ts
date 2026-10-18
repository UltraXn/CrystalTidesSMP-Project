import supabase from '../services/supabaseService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

const handleNoteError = (res: Response, error: unknown) => {
  console.error('[NoteController] Internal error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('staff_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleNoteError(res, error);
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { text, color, rotation } = req.body;
    const { data, error } = await supabase
      .from('staff_notes')
      .insert([
        {
          text,
          color: color || '#fef3c7',
          rotation: rotation || 0,
          date: new Date().toLocaleDateString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data ? data[0] : null);
  } catch (error) {
    handleNoteError(res, error);
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { error } = await supabase.from('staff_notes').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    handleNoteError(res, error);
  }
};
