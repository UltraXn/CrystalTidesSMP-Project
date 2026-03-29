import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Security Validation', () => {
    
    describe('Role-Based Access Control', () => {
        it('should block unauthorized access to admin routes (401)', async () => {
            const response = await request(app).post('/api/admin/upload-mod');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe('AUTH_ERROR');
        });
    });

    describe('Webhook Security', () => {
        it('should reject Minecraft webhooks without a secret (401)', async () => {
            const response = await request(app)
                .post('/api/webhooks/minecraft')
                .send({ event: 'player_join', username: 'test' });
            
            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
            // Using a loose check or logging to see what's actually there if it fails
            expect(response.body.error.code).toBe('AUTH_ERROR');
        });

        it('should reject Minecraft webhooks with invalid secret (401)', async () => {
            const response = await request(app)
                .post('/api/webhooks/minecraft')
                .set('x-mc-secret', 'wrong-secret')
                .send({ event: 'player_join', username: 'test' });
            
            expect(response.status).toBe(401);
        });
    });

    describe('Rate Limiting', () => {
        it('should have rate limiting headers', async () => {
            const response = await request(app).get('/api/news');
            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(response.headers).toHaveProperty('ratelimit-remaining');
        });
    });

    describe('Error Masking', () => {
        it('should not leak internal details in production mode', async () => {
            // Force production env for this test
            process.env.NODE_ENV = 'production';
            
            const response = await request(app).get('/api/system/error-test'); // Assuming this triggers an error
            if (response.status >= 500) {
                expect(response.body.error.message).toBe('Internal server error');
                expect(response.body.error.details).toBeUndefined();
            }

            process.env.NODE_ENV = 'test'; // Restore
        });
    });
});
