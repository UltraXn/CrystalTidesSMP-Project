import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as logService from '../../services/logService.js';
import supabase from '../../config/supabaseClient.js';

describe('Log Routes (/api/logs)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/logs rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  it('GET /api/logs rejects non-staff authenticated requests with 403', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'regular-user-id',
          email: 'player@crystaltides.net',
          user_metadata: {},
          app_metadata: {},
        } as unknown as import('@supabase/supabase-js').User,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { username: 'PlayerOne', role: 'user' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const res = await request(app).get('/api/logs').set('Authorization', 'Bearer valid-user-token');

    expect(res.status).toBe(403);
  });

  it('GET /api/logs returns 200 and logs data when authenticated as staff', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'staff-user-id',
          email: 'admin@crystaltides.net',
          user_metadata: {},
          app_metadata: {},
        } as unknown as import('@supabase/supabase-js').User,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { username: 'AdminUser', role: 'admin' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    vi.spyOn(logService, 'getLogs').mockResolvedValueOnce({
      data: [
        {
          id: 'log-1',
          created_at: '2026-10-04T00:00:00Z',
          username: 'AdminUser',
          action: 'UPDATE_CONFIG',
          details: 'Updated site settings',
          source: 'web',
        },
      ],
      total: 1,
    } as unknown as Awaited<ReturnType<typeof logService.getLogs>>);

    const res = await request(app)
      .get('/api/logs?page=1&limit=50&source=web&search=config')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(logService.getLogs).toHaveBeenCalledWith({
      limit: 50,
      offset: 0,
      source: 'web',
      search: 'config',
    });
  });

  it('POST /api/logs rejects invalid payload with 400', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'staff-user-id',
          email: 'admin@crystaltides.net',
          user_metadata: {},
          app_metadata: {},
        } as unknown as import('@supabase/supabase-js').User,
      },
      error: null,
    });

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { username: 'AdminUser', role: 'admin' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        // Missing source and action
        details: 'Some log details',
      });

    expect(res.status).toBe(400);
  });
});
