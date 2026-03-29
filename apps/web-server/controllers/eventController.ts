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
        const requestorUsername = (req as any).user?.username || 'Admin';

        logService.createLog({
            username: requestorUsername,
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
        const requestorUsername = (req as any).user?.username || 'Admin';

        logService.createLog({
            username: requestorUsername,
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
        const requestorUsername = (req as any).user?.username || 'Admin';
        await eventService.deleteEvent(parseInt(ensureString(req.params.id)));

        logService.createLog({
            username: requestorUsername,
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
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const registration = await eventService.registerUser(parseInt(ensureString(req.params.id)), user.id);

        logService.createLog({
            user_id: user.id,
            username: user.username || 'User', 
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
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const registrationIds = await eventService.getUserRegistrations(user.id);
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
