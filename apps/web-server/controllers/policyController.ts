import { Request, Response } from 'express';
import * as policyService from '../services/policyService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import * as logService from '../services/logService.js';
import { ensureString } from '../utils/typeUtils.js';

export const getPolicies = async (req: Request, res: Response) => {
    try {
        const policies = await policyService.getAllPolicies();
        sendSuccess(res, policies);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error fetching policies';
        sendError(res, message, 'FETCH_POLICIES_ERROR', 500, error);
    }
};

export const getPolicy = async (req: Request, res: Response) => {
    try {
        const slug = ensureString(req.params.slug);
        const policy = await policyService.getPolicyBySlug(slug);
        if (!policy) return sendError(res, 'Policy not found', 'NOT_FOUND', 404);
        sendSuccess(res, policy);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error fetching policy';
        sendError(res, message, 'FETCH_POLICY_ERROR', 500, error);
    }
};

export const updatePolicy = async (req: Request, res: Response) => {
    try {
        const slug = ensureString(req.params.slug);
        const { title, content, title_en, content_en } = req.body;
        const user = req.user;

        if (!user) return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);

        const userId = user.id;

        const policy = await policyService.updatePolicy(slug, title, content, title_en, content_en, userId);
        
        await logService.createLog({ 
            user_id: userId, 
            action: 'UPDATE_POLICY', 
            details: `Updated policy: ${slug} (EN/ES)` 
        });
        
        sendSuccess(res, policy, 'Policy updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error updating policy';
        sendError(res, message, 'UPDATE_POLICY_ERROR', 500, error);
    }
};
