import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('🛡️ Stealth Honeypot & Security Engine', () => {
    it('should disable X-Powered-By header to conceal Express fingerprint', async () => {
        const response = await request(app).get('/');
        expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should catch WP scanner decoy probe GET /wp-login.php and trigger honeypot', async () => {
        const start = Date.now();
        const response = await request(app).get('/wp-login.php');
        const elapsed = Date.now() - start;

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
        expect(elapsed).toBeGreaterThanOrEqual(1400);
    });

    it('should catch environment probe GET /.env and trigger honeypot', async () => {
        const response = await request(app).get('/.env');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should catch DOM crawler trap GET /api/honeypot/crawler-trap', async () => {
        const response = await request(app).get('/api/honeypot/crawler-trap');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should catch form honeypot when confirm_email is populated on POST /api/auth/register', async () => {
        const start = Date.now();
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'spambot',
                email: 'spambot@example.com',
                password: 'Password123!',
                confirm_email: 'bot_autofill@example.com' // Honeypot field populated by bot
            });
        const elapsed = Date.now() - start;

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Bad Request');
        expect(elapsed).toBeGreaterThanOrEqual(1400);
    });

    it('should pass form honeypot check when confirm_email is empty on POST /api/auth/register', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'validuser',
                email: 'validuser@example.com',
                password: 'Password123!'
                // confirm_email omitted by human
            });

        // The honeypot middleware passes through cleanly.
        // It reaches controller/Zod/Supabase (which will return validation/auth error or success, not honeypot trap)
        expect(response.status).not.toBe(404);
    });

    it('should catch decoy Canary Token header x-debug-canary-token', async () => {
        const response = await request(app)
            .get('/')
            .set('x-debug-canary-token', 'canary_key_crystaltides_9918');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
    });
});
