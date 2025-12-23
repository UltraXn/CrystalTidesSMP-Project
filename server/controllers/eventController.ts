import * as eventService from '../services/eventService.js';
import * as logService from '../services/logService.js';
import { Request, Response } from 'express';

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event = await eventService.createEvent(req.body);

        logService.createLog({
            username: 'Admin',
            action: 'CREATE_EVENT',
            details: `Created event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const event = await eventService.updateEvent(parseInt(req.params.id), req.body);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_EVENT',
            details: `Updated event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        await eventService.deleteEvent(parseInt(req.params.id));

        logService.createLog({
            username: 'Admin',
            action: 'DELETE_EVENT',
            details: `Deleted event ID: ${req.params.id}`,
            source: 'web'
        }).catch(console.error);

        res.json({ message: "Evento eliminado" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const registerForEvent = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; 
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registration = await eventService.registerUser(parseInt(req.params.id), userId);

        logService.createLog({
            user_id: userId,
            username: 'User', 
            action: 'EVENT_REGISTER',
            details: `Registered for event ${req.params.id}`,
            source: 'web'
        }).catch(console.error);

        res.json(registration);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getUserRegistrations = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registrationIds = await eventService.getUserRegistrations(userId);
        res.json(registrationIds);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
    try {
        const registrations = await eventService.getRegistrations(parseInt(req.params.id));
        res.json(registrations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
