import { Request, Response } from 'express';
import { z } from 'zod';
import { listEvents, createEvent } from '../services/googleCalendarService.js';

const SyncCalendarTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    date: z.string().min(1, 'Date is required')
});

export const getCalendarEvents = async (req: Request, res: Response) => {
    try {
        const events = await listEvents(20); // Get next 20 events
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
};

export const syncTaskToCalendar = async (req: Request, res: Response) => {
    try {
        const parseResult = SyncCalendarTaskSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ 
                error: 'Validation Error', 
                details: parseResult.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
            });
        }

        const { title, description, date } = parseResult.data;

        const event = await createEvent({
            summary: `[Kanban] ${title}`,
            description: description || 'Synced from CrystalTides Kanban',
            start: date // Expecting ISO string or understood date format
        });

        res.json({ success: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to sync task to calendar' });
    }
};

export const getCalendarSubscribeLink = async (req: Request, res: Response) => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
        return res.status(500).json({ error: 'Calendar ID not configured' });
    }
    // Standard Google Calendar subscribe URL
    const subscribeUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`;
    res.json({ url: subscribeUrl });
};
