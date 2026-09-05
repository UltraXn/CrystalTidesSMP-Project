import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as ruleService from '../../services/ruleService.js';
import supabase from '../../config/supabaseClient.js';

describe('Rule Routes (/api/rules)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/rules returns 200 and list of rules', async () => {
    // Arrange
    vi.spyOn(ruleService, 'getAllRules').mockResolvedValueOnce([
      {
        id: 1,
        category: 'General',
        title: 'Respeto Mutuo',
        content: 'Tratar a todos con respeto y dignidad.',
        sort_order: 1,
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-09-01T00:00:00Z',
      },
    ]);

    // Act
    const res = await request(app).get('/api/rules');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Respeto Mutuo');
  });

  it('POST /api/rules rejects unauthenticated requests with 401', async () => {
    // Act
    const res = await request(app)
      .post('/api/rules')
      .send({ category: 'General', title: 'No Hacks', content: 'Prohibido cheats' });

    // Assert
    expect(res.status).toBe(401);
  });

  it('POST /api/rules creates a rule when user is authenticated with staff role', async () => {
    // Arrange
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'staff-user-id',
          email: 'staff@crystaltides.net',
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
        data: { username: 'StaffMember', role: 'moderator' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    vi.spyOn(ruleService, 'createRule').mockResolvedValueOnce({
      id: 2,
      category: 'Gameplay',
      title: 'No Griefing',
      content: 'No destruir construcciones ajenas.',
      sort_order: 2,
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
    });

    // Act
    const res = await request(app)
      .post('/api/rules')
      .set('Authorization', 'Bearer valid-staff-token')
      .send({
        category: 'Gameplay',
        title: 'No Griefing',
        content: 'No destruir construcciones ajenas.',
        sort_order: 2,
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('No Griefing');
  });
});
