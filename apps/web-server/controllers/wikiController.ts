import { Request, Response } from 'express';
import * as wikiService from '../services/wikiService.js';
import { WikiArticle } from '../services/wikiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

export const getArticles = async (req: Request, res: Response) => {
    try {
        const category = ensureString(req.query.category);
        const articles = await wikiService.getAllArticles(category);
        return sendSuccess(res, articles);
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching wiki articles');
    }
};

export const getArticle = async (req: Request, res: Response) => {
    try {
        const slug = ensureString(req.params.slug);
        const article = await wikiService.getArticleBySlug(slug);
        if (!article) return sendError(res, 'Article not found', 'NOT_FOUND', 404);
        return sendSuccess(res, article);
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching wiki article');
    }
};

export const createWikiArticle = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const articleData = { ...req.body, author_id: user?.id };
        const article = await wikiService.createArticle(articleData);
        return sendSuccess(res, article, 'Article created');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error creating wiki article');
    }
};

export const updateWikiArticle = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const article = await wikiService.updateArticle(parseInt(id), req.body);
        return sendSuccess(res, article, 'Article updated');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error updating wiki article');
    }
};

export const deleteWikiArticle = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        await wikiService.deleteArticle(parseInt(id));
        return sendSuccess(res, null, 'Article deleted');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error deleting wiki article');
    }
};
