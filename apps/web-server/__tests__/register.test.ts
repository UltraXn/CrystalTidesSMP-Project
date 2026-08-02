import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import supabase from '../config/supabaseClient.js';

describe('Public Registration Endpoint (/api/auth/register)', () => {
    it('should reject requests with invalid email or short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'invalid-email',
                password: 'short',
                username: 'valid_user'
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Validation Error');
    });

    it('should silent-drop honeypot bot submissions', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'bot@spammer.com',
                password: 'password123',
                username: 'bot_user',
                website: 'http://spambot.com' // Honeypot filled!
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should call Supabase Admin createUser for legitimate registrations', async () => {
        // Mock supabase.auth.admin.createUser
        const spy = vi.spyOn(supabase.auth.admin, 'createUser').mockResolvedValueOnce({
            data: { user: { id: 'mocked-user-id' } as unknown as import('@supabase/supabase-js').User },
            error: null
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'legit_test_user@example.com',
                password: 'ValidPassword123!',
                username: 'legit_player'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(spy).toHaveBeenCalledWith({
            email: 'legit_test_user@example.com',
            password: 'ValidPassword123!',
            user_metadata: { username: 'legit_player' },
            email_confirm: true
        });

        spy.mockRestore();
    });
});

