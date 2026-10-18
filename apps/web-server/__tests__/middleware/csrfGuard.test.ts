import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

const FOREIGN = 'https://evil.example';
const OWN = 'https://crystaltidessmp.net';

// Any write route works: the guard runs before routing.
const register = () => request(app).post('/api/auth/register');

describe('rejectCrossSiteWrites (CSRF)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses a write sent by a browser from another site', async () => {
    const res = await register().set({ Origin: FOREIGN, 'Sec-Fetch-Site': 'cross-site' }).send({});

    expect(res.status).toBe(403);
  });

  it('refuses a foreign Origin even without Fetch Metadata (older browsers)', async () => {
    const res = await register().set({ Origin: FOREIGN }).send({});

    expect(res.status).toBe(403);
  });

  it('refuses the opaque "null" origin (sandboxed iframes, file:// pages)', async () => {
    const res = await register().set({ Origin: 'null' }).send({});

    expect(res.status).toBe(403);
  });

  it('lets the own front end through, also from the second domain', async () => {
    for (const origin of [OWN, 'https://crystaltides.net']) {
      const res = await register().set({ Origin: origin, 'Sec-Fetch-Site': 'cross-site' }).send({});
      expect(res.status, origin).not.toBe(403);
    }
  });

  it('lets server-to-server callers through (no Origin, no Sec-Fetch-Site)', async () => {
    const res = await register().send({});

    expect(res.status).not.toBe(403);
  });

  it('never blocks reads', async () => {
    const res = await request(app)
      .get('/api/gacha/tiers')
      .set({ Origin: FOREIGN, 'Sec-Fetch-Site': 'cross-site' });

    expect(res.status).toBe(200);
  });
});

describe('form-encoded bodies', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('are not parsed on regular API routes (what a cross-site <form> sends)', async () => {
    const res = await register()
      .type('form')
      .send({ email: 'victim@example.test', password: 'Password123!', username: 'victim' });

    // Validation fails because the body was never parsed.
    expect(res.status).toBe(400);
  });

  it('are still parsed on the Ko-Fi webhook', async () => {
    // Valid token, incomplete payload: 400 from the schema means the form was read;
    // an unparsed body would fail the token check first (403).
    const res = await request(app)
      .post('/api/webhooks/kofi')
      .type('form')
      .send({ data: JSON.stringify({ verification_token: process.env.KOFI_VERIFICATION_TOKEN }) });

    expect(res.status).toBe(400);
  });
});
