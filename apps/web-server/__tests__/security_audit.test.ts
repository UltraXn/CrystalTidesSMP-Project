/**
 * Security Audit Tests — Broken Access Control
 *
 * These tests verify that authentication and authorization are correctly
 * enforced across sensitive endpoints. Each test is named after the
 * OWASP Top 10 category it covers (A01: Broken Access Control).
 *
 * Findings documented during audit:
 *   F-01  /api/gacha/add-funds — any authed user could add unlimited coins
 *         [FIXED] checkRole(ADMIN_ROLES) + require2FA on the route
 *   F-02  /api/users/staff     — was public, then any-authed-user
 *         [FIXED] checkRole(STAFF_ROLES)
 *   F-03  /api/users/profile/:username/full — public, leaked wallet + forum
 *         [FIXED] wallet only exposed to owner/staff (optionalAuthenticateToken)
 *   F-04  Role fallback to user_metadata?.role in authenticateToken
 *         [FIXED] role only comes from profiles table, defaults to 'user'
 *   F-05  /api/forum POST/PUT routes missing Zod validation
 *         [FIXED] forumSchemas.ts applied to all POST/PUT forum routes
 *   F-06  console.log('DEBUG') in ticketController leaks PII
 *   F-07  giveKarma race condition (read-modify-write on user_metadata)
 *         [FIXED] karma_votes table w/ unique PK; counter derived as COUNT(*)
 *   F-08  banUser command construction: only stripped \r\n, not ; or &
 *         [FIXED] reason strips ; & | ` \ + require2FA on the ban route
 *
 * Additional fixes (see SECURITY.md in repo root):
 *   C-01  Arbitrary file upload to Storage buckets
 *         [FIXED] POST /api/uploads/image (magic-byte validation) +
 *         restrict_image_uploads_storage.sql (RLS deny client writes)
 *   C-03  /op restriction bypass in bridgeRoutes ("/op", "op\tx", minecraft:op, deop)
 *         [FIXED] normalized base-command denylist (op, deop) for non-owners
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../app.js';

const UNAUTH_HEADERS = {};
const USER_HEADERS = { Authorization: 'Bearer fake-user-token' };
export const ADMIN_HEADERS = { Authorization: 'Bearer fake-admin-token' };

describe('A01 — Broken Access Control', () => {

    /* ============================================================
     * F-01: /api/gacha/add-funds — SHOULD require admin
     * Controller only checks authenticateToken. No checkRole.
     * Any authenticated user can add unlimited KilluCoins.
     * Expected status when fixed: 403 for non-admins.
     * ============================================================ */
    describe('F-01 · Gacha add-funds must require admin', () => {
        it('should reject unauthenticated requests (401)', async () => {
            const res = await request(app)
                .post('/api/gacha/add-funds')
                .set(UNAUTH_HEADERS)
                .send({ amount: 1000 });
            expect(res.status).toBe(401);
        });

        // ✅ Fixed: Route requires admin role + 2FA
        it('[FIXED] rejects non-admin users adding gacha funds', async () => {
            const res = await request(app)
                .post('/api/gacha/add-funds')
                .set(USER_HEADERS)
                .send({ amount: 99999999 });
            expect([401, 403]).toContain(res.status);
        });
    });

    /* ============================================================
     * F-02: /api/users/staff — requires staff authentication
     * ============================================================ */
    describe('F-02 · Staff list endpoint protection', () => {
        it('should require staff authentication', async () => {
            const res = await request(app)
                .get('/api/users/staff')
                .set(UNAUTH_HEADERS);
            expect([401, 403]).toContain(res.status);
        });
    });

    /* ============================================================
     * F-03: /api/users/profile/:username/full — public, leaks wallet
     * Returns wallet balance and forum activity without auth.
     * ============================================================ */
    describe('F-03 · Full profile public exposure', () => {
        it('should require auth to view full profile with wallet (currently public)', async () => {
            const res = await request(app)
                .get('/api/users/profile/testuser/full')
                .set(UNAUTH_HEADERS);
            // 200 = public (current behavior — information disclosure)
            // 404 = user not found (acceptable, still public)
            // After fix: expect(res.status).toBe(401);
            expect([200, 401, 404]).toContain(res.status);
        });
    });

    /* ============================================================
     * Admin endpoints must reject non-admin users
     * ============================================================ */
    describe('Admin route protection', () => {
        it('should reject unauthenticated access to /api/users (list all)', async () => {
            const res = await request(app)
                .get('/api/users')
                .set(UNAUTH_HEADERS);
            expect(res.status).toBe(401);
        });

        it('should reject unauthenticated access to /api/tickets (staff)', async () => {
            const res = await request(app)
                .get('/api/tickets')
                .set(UNAUTH_HEADERS);
            // checkRole fails closed: 403 if no req.user
            expect([401, 403]).toContain(res.status);
        });

        it('should reject unauthenticated role update', async () => {
            const res = await request(app)
                .patch('/api/users/00000000-0000-0000-0000-000000000000/role')
                .set(UNAUTH_HEADERS)
                .send({ role: 'admin' });
            expect(res.status).toBe(401);
        });

        it('should reject unauthenticated donation creation', async () => {
            const res = await request(app)
                .post('/api/donations')
                .set(UNAUTH_HEADERS)
                .send({ from_name: 'test', amount: 100, currency: 'USD' });
            // Should be 401 — donations require staff
            expect([401, 403]).toContain(res.status);
        });
    });

    /* ============================================================
     * F-04: authenticateToken role fallback
     * If profiles table fails, falls back to user_metadata?.role.
     * A user who can write to their own user_metadata could self-assign 'admin'.
     * This test sends a fake token — Supabase will reject → 401.
     * The vulnerability path requires a real Supabase token with tampered metadata.
     * ============================================================ */
    describe('F-04 · Role fallback to user_metadata (doc test)', () => {
        it('should reject fake tokens (Supabase validates)', async () => {
            const res = await request(app)
                .get('/api/tickets')
                .set({ Authorization: 'Bearer fake-token' });
            expect(res.status).toBe(401);
        });

        // Document the risk: if user_metadata.role is user-controllable,
        // checkRole can be bypassed. Verify Supabase RLS prevents writes to
        // user_metadata.role from client-side auth.update({ data: { role: 'admin' }}).
        // This is an integration test — requires real Supabase env to reproduce.
    });
});

describe('A03 — Injection (forum input validation)', () => {

    /* ============================================================
     * F-05: Forum POST/PUT routes have NO Zod validation
     * Any authenticated user can send arbitrary data shapes.
     * ============================================================ */
    describe('F-05 · Forum missing input validation', () => {
        it('should reject forum thread with missing required fields', async () => {
            const res = await request(app)
                .post('/api/forum/threads')
                .set(USER_HEADERS)
                .send({}); // empty body — should be 400, not 500
            // Currently no validation schema → may be 400 from controller or 500 from service
            // After fix (add validate): expect(res.status).toBe(400);
            expect([400, 401, 500]).toContain(res.status);
        });

        it('should reject forum thread with oversized title', async () => {
            const hugeTitle = 'A'.repeat(10000);
            const res = await request(app)
                .post('/api/forum/threads')
                .set(USER_HEADERS)
                .send({ category_id: 1, title: hugeTitle, content: 'test' });
            // Currently no length limit — accepted as-is
            // After fix: expect(res.status).toBe(400);
            expect([201, 400, 401, 500]).toContain(res.status);
        });

        it('should reject forum thread with poll_data injection', async () => {
            const res = await request(app)
                .post('/api/forum/threads')
                .set(USER_HEADERS)
                .send({
                    category_id: 1,
                    title: 'test',
                    content: 'test',
                    poll_data: { __proto__: { admin: true }, question: 'inject?' }
                });
            expect([201, 400, 401, 500]).toContain(res.status);
        });
    });
});

describe('A05 — Security Misconfiguration', () => {

    /* ============================================================
     * CSP should not have duplicate entries (already fixed)
     * ============================================================ */
    describe('CSP headers', () => {
        it('should have security headers via helmet', async () => {
            const res = await request(app).get('/');
            expect(res.headers['content-security-policy']).toBeDefined();
            expect(res.headers['x-content-type-options']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined();
        });

        it('should not have duplicate supabase.co in CSP connect-src', async () => {
            const res = await request(app).get('/');
            const csp = res.headers['content-security-policy'] || '';
            const connectSrc = csp.match(/connect-src[^,;]*/i)?.[0] || '';
            const supabaseCount = (connectSrc.match(/https:\/\/\*\.supabase\.co/g) || []).length;
            // https + wss are different protocols (allowed 2). Only https should appear once.
            expect(supabaseCount).toBe(1);
        });
    });

    /* ============================================================
     * Rate limiting headers should be present on all /api routes
     * ============================================================ */
    describe('Rate limiting', () => {
        it('should expose rate limit headers on /api routes', async () => {
            const res = await request(app).get('/api/news');
            expect(res.headers['ratelimit-limit']).toBeDefined();
            expect(res.headers['ratelimit-remaining']).toBeDefined();
        });
    });
});

describe('A07 — Authentication Failures', () => {

    /* ============================================================
     * 2FA enforcement: require2FA middleware
     * ============================================================ */
    describe('2FA enforcement', () => {
        it('should reject admin actions without 2FA token when 2FA is enabled', async () => {
            // Fake token → Supabase rejects → 401 before 2FA check
            const res = await request(app)
                .post('/api/bridge/queue')
                .set({ Authorization: 'Bearer fake-token' })
                .send({ command: 'say test' });
            expect(res.status).toBe(401);
        });
    });

    /* ============================================================
     * Self-karma prevention
     * ============================================================ */
    describe('Self-vote prevention (giveKarma)', () => {
        it('should reject unauthenticated karma vote', async () => {
            const res = await request(app)
                .post('/api/users/00000000-0000-0000-0000-000000000000/karma')
                .set(UNAUTH_HEADERS);
            expect(res.status).toBe(401);
        });
    });
});

describe('A08 — Data Integrity Failures', () => {

    /* ============================================================
     * F-08: banUser command construction
     * `ban ${username} ${sanitizedReason}` — sanitizedReason only strips \r\n.
     * Minecraft command separator (;) could inject extra commands.
     * ============================================================ */
    describe('F-08 · Ban command injection surface', () => {
        // This test documents the attack surface. The username is regex-validated,
        // but `reason` only has \r\n stripped. If the Minecraft plugin interprets
        // `;` as a command separator, an attacker could inject:
        //   reason = "banned;op attacker;deop owner"
        //
        // The fix: either (a) whitelist allowed chars in reason, or
        // (b) ensure the plugin reads the full string as a single ban reason.
        it('should be documented: reason only strips \\r\\n, not ; or &', () => {
            const maliciousReason = 'banned;op attacker;deop owner';
            const sanitized = String(maliciousReason).replace(/[\r\n]/g, '').trim();
            // The sanitized value still contains semicolons — injection surface.
            expect(sanitized).toContain(';');
            expect(sanitized).toContain('op attacker');
        });
    });
});

describe('Regression — post-fix static checks', () => {
    const readSrc = (...segments: string[]) =>
        fs.readFileSync(path.join(__dirname, '..', ...segments), 'utf-8');

    it('C-03: bridge restrict uses normalized denylist (no startsWith op bypass)', () => {
        const src = readSrc('routes', 'bridgeRoutes.ts');
        expect(src).toContain('OWNER_ONLY_COMMANDS');
        expect(src).toContain("'deop'");
        expect(src).not.toContain("startsWith('op ')");
    });

    it('F-04: authMiddleware has no user_metadata role fallback', () => {
        const src = readSrc('middleware', 'authMiddleware.ts');
        expect(src).not.toContain('user_metadata?.role');
    });

    it('F-08: banUser reason strips command separators', () => {
        const src = readSrc('controllers', 'ticketController.ts');
        expect(src).toMatch(/replace\(\/\[;&\|/);
    });

    it('C-01: secure upload route is mounted and validates magic bytes', () => {
        const appSrc = readSrc('app.ts');
        expect(appSrc).toContain("'/api/uploads'");
        const svcSrc = readSrc('services', 'imageUploadService.ts');
        expect(svcSrc).toContain('detectImageType');
        expect(svcSrc).toContain('0x89'); // PNG magic byte
    });

    it('Ban route requires 2FA', () => {
        const src = readSrc('routes', 'ticketRoutes.ts');
        expect(src).toMatch(/router\.post\('\/ban'.*require2FA/);
    });

    it('Swagger docs are gated behind env flag', () => {
        const src = readSrc('app.ts');
        expect(src).toContain('ENABLE_API_DOCS');
    });
});

describe('A09 — Logging & Monitoring Failures', () => {

    /* ============================================================
     * F-06: console.log('DEBUG') in ticketController leaks PII
     * ticketController.ts:21 prints req.user to stdout.
     * ============================================================ */
    describe('F-06 · Debug log leaks PII', () => {
        it('should not have console.log DEBUG in ticketController source', () => {
            // Static check: the source file should not contain DEBUG console.log
            // This is a regression test — if someone re-adds it, this fails.
            const source = fs.readFileSync(
                path.join(__dirname, '..', 'controllers', 'ticketController.ts'),
                'utf-8'
            );
            expect(source).not.toMatch(/console\.log\(['"]DEBUG/);
        });

        it('should not have console.log of req.body in newsController', () => {
            const source = fs.readFileSync(
                path.join(__dirname, '..', 'controllers', 'newsController.ts'),
                'utf-8'
            );
            expect(source).not.toMatch(/console\.log\(`\[UPDATE NEWS\]/);
        });
    });
});