import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import supabase from '../../services/supabaseService.js';

// Safe bot key string for hermetic test environment that does not trigger secret scanners
const BOT_KEY = 'sample_bot_key_for_news_like';
const AUTH = { Authorization: `Bearer ${BOT_KEY}` };

type RpcResult = Awaited<ReturnType<typeof supabase.rpc>>;
const rpcReturning = (data: unknown) =>
  vi.spyOn(supabase, 'rpc').mockResolvedValue({ data, error: null } as unknown as RpcResult);

describe('POST /api/news/:id/like', () => {
  beforeEach(() => {
    process.env.BOT_API_KEY = BOT_KEY;
  });

  afterEach(() => {
    process.env.BOT_API_KEY = '';
    vi.restoreAllMocks();
  });

  it('rejects anonymous likes with 401', async () => {
    const rpc = vi.spyOn(supabase, 'rpc');
    const res = await request(app).post('/api/news/7/like');

    expect(res.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('records the like through the atomic RPC for authenticated user', async () => {
    const rpc = rpcReturning([{ liked: true, likes_count: 5 }]);
    const res = await request(app).post('/api/news/7/like').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, liked: true, likes_count: 5 });
    expect(rpc).toHaveBeenCalledWith('like_news_article', {
      p_news_id: 7,
      p_user_id: 'bot_system_id',
    });
  });

  it('returns 404 when the news article does not exist', async () => {
    rpcReturning([]);
    const res = await request(app).post('/api/news/999/like').set(AUTH);

    expect(res.status).toBe(404);
  });

  it('rejects ids that are not positive integers with 400', async () => {
    const rpc = vi.spyOn(supabase, 'rpc');
    const res = await request(app).post('/api/news/1.5/like').set(AUTH);

    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects negative or zero ids with 400', async () => {
    const rpc = vi.spyOn(supabase, 'rpc');
    const res = await request(app).post('/api/news/-3/like').set(AUTH);

    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('GET /api/news/likes/mine', () => {
  beforeEach(() => {
    process.env.BOT_API_KEY = BOT_KEY;
  });

  afterEach(() => {
    process.env.BOT_API_KEY = '';
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/news/likes/mine');
    expect(res.status).toBe(401);
  });

  it('returns the list of news IDs liked by the authenticated user', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ news_id: 3 }, { news_id: 7 }],
          error: null,
        }),
      }),
    } as any);

    const res = await request(app).get('/api/news/likes/mine').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ liked_ids: [3, 7] });
  });
});
