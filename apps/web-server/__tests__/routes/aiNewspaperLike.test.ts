import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { supabase } from '../../services/ragService.js';

// authenticateToken reads BOT_API_KEY per request; the bot is the only identity
// the hermetic test env can authenticate without a real Supabase project.
const BOT_KEY = 'test-bot-key-for-like-route';
const AUTH = { Authorization: `Bearer ${BOT_KEY}` };

type RpcResult = Awaited<ReturnType<typeof supabase.rpc>>;
const rpcReturning = (data: unknown) =>
  vi.spyOn(supabase, 'rpc').mockResolvedValue({ data, error: null } as unknown as RpcResult);

describe('POST /api/ai/newspaper/:id/like', () => {
  beforeEach(() => {
    process.env.BOT_API_KEY = BOT_KEY;
  });

  afterEach(() => {
    process.env.BOT_API_KEY = '';
    vi.restoreAllMocks();
  });

  it('rejects anonymous likes', async () => {
    const rpc = vi.spyOn(supabase, 'rpc');
    const res = await request(app).post('/api/ai/newspaper/7/like');

    expect(res.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('records the like through the atomic RPC for the caller', async () => {
    const rpc = rpcReturning([{ liked: true, likes_count: 3 }]);
    const res = await request(app).post('/api/ai/newspaper/7/like').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, liked: true, likes_count: 3 });
    expect(rpc).toHaveBeenCalledWith('like_newspaper_edition', {
      p_edition_id: 7,
      p_user_id: 'bot_system_id',
    });
  });

  it('answers 404 when the edition does not exist', async () => {
    rpcReturning([]);
    const res = await request(app).post('/api/ai/newspaper/999/like').set(AUTH);

    expect(res.status).toBe(404);
  });

  it('rejects ids that are not positive integers', async () => {
    const rpc = vi.spyOn(supabase, 'rpc');
    const res = await request(app).post('/api/ai/newspaper/1.5/like').set(AUTH);

    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('GET /api/rag/search', () => {
  it('is not public: every query computes embeddings', async () => {
    const res = await request(app).get('/api/rag/search?q=Ignis');

    expect(res.status).toBe(401);
  });
});
