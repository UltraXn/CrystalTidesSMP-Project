import * as forumService from '../services/forumService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';
import { sendError } from '../utils/responseHandler.js';

const FORUM_CONSTANTS = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  THREAD_NOT_FOUND: 'Thread not found',
  UNKNOWN_USER: 'Unknown',
} as const;

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const handleStandardError = (res: Response, error: unknown) => {
  return sendError(res, getErrorMessage(error));
};

const handleActionError = (res: Response, error: unknown) => {
  const message = getErrorMessage(error);
  if (message.includes(FORUM_CONSTANTS.FORBIDDEN)) {
    return res.status(403).json({ error: message });
  }
  return sendError(res, message);
};

export const getThreads = async (req: Request, res: Response) => {
  try {
    const categoryId = ensureString(req.params.categoryId);
    const data = await forumService.getThreads(Number.parseInt(categoryId, 10));
    res.json(data);
  } catch (error) {
    const message = getErrorMessage(error);
    if (message.includes('does not exist')) return res.json([]);
    return sendError(res, message);
  }
};

export const getUserThreads = async (req: Request, res: Response) => {
  try {
    const userId = ensureString(req.params.userId);
    const data = await forumService.getUserThreads(userId);
    res.json(data);
  } catch (error) {
    return handleStandardError(res, error);
  }
};

export const getThread = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const data = await forumService.getThread(id);
    res.json(data);
  } catch {
    res.status(404).json({ error: FORUM_CONSTANTS.THREAD_NOT_FOUND });
  }
};

/**
 * Aggregated Endpoint: Thread + Poll + Posts
 * Optimizes initial load by fetching everything in parallel
 */
export const getThreadFull = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);

    // Fetch Thread (includes Poll) and Posts in parallel
    // forumService.getThread handles both numeric ID and slug strings
    const [thread, posts] = await Promise.all([
      forumService.getThread(id),
      forumService.getPosts(id),
    ]);

    res.json({ ...thread, posts });
  } catch (error) {
    res.status(404).json({ error: getErrorMessage(error) });
  }
};

export const createThread = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const { category_id, title, content, poll_data } = req.body;
    const result = await forumService.createThread({
      category_id,
      title,
      content,
      poll_data,
      user_data: {
        id: req.user.id,
        name: req.user.username || FORUM_CONSTANTS.UNKNOWN_USER,
        avatar: req.user.avatar_url || '',
        role: req.user.role,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    return handleStandardError(res, error);
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const data = await forumService.getPosts(ensureString(req.params.id));
    res.json(data);
  } catch (error) {
    return handleStandardError(res, error);
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const result = await forumService.createPost({
      thread_id: ensureString(req.params.id),
      content: req.body.content,
      user_data: {
        id: req.user.id,
        name: req.user.username || FORUM_CONSTANTS.UNKNOWN_USER,
        avatar: req.user.avatar_url || '',
        role: req.user.role,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    return handleStandardError(res, error);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const data = await forumService.getCategoryStats();
    res.json(data);
  } catch (error) {
    return handleStandardError(res, error);
  }
};

export const updateThread = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const id = ensureString(req.params.id);
    const result = await forumService.updateThread(id, req.body, req.user);
    res.json(result);
  } catch (error) {
    return handleActionError(res, error);
  }
};

export const deleteThread = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const id = ensureString(req.params.id);
    await forumService.deleteThread(id, req.user);
    res.json({ message: 'Thread deleted' });
  } catch (error) {
    return handleActionError(res, error);
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const id = ensureString(req.params.id);
    const result = await forumService.updatePost(Number.parseInt(id, 10), req.body, req.user);
    res.json(result);
  } catch (error) {
    return handleActionError(res, error);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: FORUM_CONSTANTS.UNAUTHORIZED });

    const id = ensureString(req.params.id);
    await forumService.deletePost(Number.parseInt(id, 10), req.user);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    return handleActionError(res, error);
  }
};
