import * as forumService from '../services/forumService.js';
import { Request, Response } from 'express';

export const getThreads = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const data = await forumService.getThreads(parseInt(categoryId));
        res.json(data);
    } catch (error: any) {
        if (error.message && error.message.includes('does not exist')) return res.json([]);
        res.status(500).json({ error: error.message });
    }
};

export const getUserThreads = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const data = await forumService.getUserThreads(userId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await forumService.getThread(parseInt(id));
        res.json(data);
    } catch (error: any) {
        res.status(404).json({ error: "Thread not found" });
    }
};

export const createThread = async (req: Request, res: Response) => {
    try {
        const result = await forumService.createThread(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const data = await forumService.getPosts(parseInt(req.params.id));
        res.json(data);
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const result = await forumService.createPost({...req.body, thread_id: parseInt(req.params.id)});
        res.status(201).json(result);
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const data = await forumService.getCategoryStats();
        res.json(data);
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const updateThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await forumService.updateThread(parseInt(id), req.body);
        res.json(result);
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const deleteThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await forumService.deleteThread(parseInt(id));
        res.json({ message: "Thread deleted" });
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await forumService.updatePost(parseInt(id), req.body);
        res.json(result);
    } catch (e: any) { res.status(500).json({error:e.message}); }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await forumService.deletePost(parseInt(id));
        res.json({ message: "Post deleted" });
    } catch (e: any) { res.status(500).json({error:e.message}); }
};
