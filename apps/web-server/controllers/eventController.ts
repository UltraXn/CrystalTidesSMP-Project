import * as eventService from '../services/eventService.js';
import * as logService from '../services/logService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        console.log("Creating event - Body received:", JSON.stringify(req.body));
        const event = await eventService.createEvent(req.body);

        logService.createLog({
            username: 'Admin',
            action: 'CREATE_EVENT',
            details: `Created event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const event = await eventService.updateEvent(parseInt(ensureString(req.params.id)), req.body);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_EVENT',
            details: `Updated event: ${event.title}`,
            source: 'web'
        }).catch(console.error);

        res.json(event);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        await eventService.deleteEvent(parseInt(ensureString(req.params.id)));

        logService.createLog({
            username: 'Admin',
            action: 'DELETE_EVENT',
            details: `Deleted event ID: ${ensureString(req.params.id)}`,
            source: 'web'
        }).catch(console.error);

        res.json({ message: "Evento eliminado" });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const registerForEvent = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; 
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registration = await eventService.registerUser(parseInt(ensureString(req.params.id)), userId);

        logService.createLog({
            user_id: userId,
            username: 'User', 
            action: 'EVENT_REGISTER',
            details: `Registered for event ${ensureString(req.params.id)}`,
            source: 'web'
        }).catch(console.error);

        res.json(registration);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: message });
    }
};

export const getUserRegistrations = async (req: Request, res: Response) => {
    try {
        const userId = ensureString(req.query.userId);
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const registrationIds = await eventService.getUserRegistrations(userId);
        res.json(registrationIds);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
    try {
        const registrations = await eventService.getRegistrations(parseInt(ensureString(req.params.id)));
        res.json(registrations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
