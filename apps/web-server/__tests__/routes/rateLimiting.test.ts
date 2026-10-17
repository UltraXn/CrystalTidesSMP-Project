/* eslint-disable sonarjs/no-hardcoded-ip -- fixture addresses (TEST-NET and Cloudflare edges) */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import app from '../../app.js';

const SENSITIVE_LIMIT = 10;

// supertest connects from loopback; with `trust proxy` = 1 the X-Forwarded-For
// entry plays the Cloudflare edge that reached Cloud Run.
const viaCloudflare = (clientIp: string) => ({
  'X-Forwarded-For': '172.67.10.10',
  'CF-Connecting-IP': clientIp,
});

const register = (headers: Record<string, string> = {}) =>
  request(app).post('/api/auth/register').set(headers).send({});

describe('strict rate limiting', () => {
  it('throttles registration per client even if every request brings a new cookie', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt <= SENSITIVE_LIMIT; attempt++) {
      const res = await register({ Cookie: `device_id=${crypto.randomUUID()}` });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, SENSITIVE_LIMIT).every((status) => status === 400)).toBe(true);
    expect(statuses[SENSITIVE_LIMIT]).toBe(429);
  });

  it('keys clients behind Cloudflare by their real IP, not by the shared edge', async () => {
    for (let attempt = 0; attempt < SENSITIVE_LIMIT; attempt++) {
      await register(viaCloudflare('203.0.113.10'));
    }

    const sameClient = await register(viaCloudflare('203.0.113.10'));
    const otherClient = await register(viaCloudflare('203.0.113.11'));

    expect(sameClient.status).toBe(429);
    expect(otherClient.status).toBe(400);
  });

  it('throttles RAG ingestion attempts per client IP', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt <= SENSITIVE_LIMIT; attempt++) {
      const res = await request(app)
        .post('/api/rag/ingest')
        .set(viaCloudflare('203.0.113.30'))
        .send({});
      statuses.push(res.status);
    }

    expect(statuses.slice(0, SENSITIVE_LIMIT).every((status) => status !== 429)).toBe(true);
    expect(statuses[SENSITIVE_LIMIT]).toBe(429);
  });

  it('gives each sensitive route its own budget', async () => {
    const client = viaCloudflare('203.0.113.50');
    for (let attempt = 0; attempt < SENSITIVE_LIMIT; attempt++) {
      await register(client);
    }

    const registerAgain = await register(client);
    const ragIngest = await request(app).post('/api/rag/ingest').set(client).send({});

    expect(registerAgain.status).toBe(429);
    expect(ragIngest.status).not.toBe(429);
  });

  it('does not apply the strict budget to public reads', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < SENSITIVE_LIMIT + 5; attempt++) {
      const res = await request(app).get('/api/gacha/tiers').set(viaCloudflare('203.0.113.20'));
      statuses.push(res.status);
    }

    expect(statuses.every((status) => status === 200)).toBe(true);
  });
});
