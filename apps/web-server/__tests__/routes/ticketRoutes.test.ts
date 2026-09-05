import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as ticketService from '../../services/ticketService.js';
import supabase from '../../config/supabaseClient.js';
import type { UserResponse } from '@supabase/supabase-js';

describe('Ticket Routes (/api/tickets)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication & Role Protection', () => {
    it('rejects unauthenticated requests to GET /api/tickets with 401', async () => {
      // Act
      const res = await request(app).get('/api/tickets');

      // Assert
      expect(res.status).toBe(401);
    });

    it('rejects regular users accessing staff-only GET /api/tickets with 403', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-regular-123',
            email: 'player@crystaltides.net',
            user_metadata: { username: 'NormalPlayer' },
            app_metadata: { role: 'user' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      // Act
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer valid-user-token');

      // Assert
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tickets (Staff)', () => {
    it('allows staff members and returns 200 with all tickets', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'staff-admin-999',
            email: 'admin@crystaltides.net',
            user_metadata: { username: 'AdminMaster' },
            app_metadata: { role: 'admin' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { username: 'AdminMaster', role: 'admin' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      vi.spyOn(ticketService, 'getAllTickets').mockResolvedValueOnce([
        {
          id: 101,
          user_id: 'player-1',
          subject: 'Bug con cofre abisal',
          description: 'El cofre en la zona abisal no abre correctamente al hacer clic derecho',
          priority: 'high',
          status: 'open',
          created_at: '2026-09-01T12:00:00Z',
          updated_at: '2026-09-01T12:00:00Z',
        },
      ]);

      // Act
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer valid-admin-token');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].subject).toBe('Bug con cofre abisal');
    });
  });

  describe('POST /api/tickets', () => {
    it('returns 400 when body fails Zod validation', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'player-xyz',
            email: 'player@crystaltides.net',
            user_metadata: { username: 'PlayerX' },
            app_metadata: { role: 'user' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      // Act: Sending invalid body (title and description too short)
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Hi',
          subject: 'Hi',
          description: 'Short',
        });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('creates ticket successfully and returns 200 with created ticket data', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'player-xyz',
            email: 'player@crystaltides.net',
            user_metadata: { username: 'PlayerX' },
            app_metadata: { role: 'user' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      vi.spyOn(ticketService, 'createTicket').mockResolvedValueOnce({
        id: 202,
        user_id: 'player-xyz',
        subject: 'No puedo reclamar rango Donador',
        description: 'Realice la compra por Ko-Fi hace una hora y aun no se refleja en el servidor',
        priority: 'medium',
        status: 'open',
        created_at: '2026-09-02T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
      });

      // Act
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'No puedo reclamar rango Donador',
          subject: 'No puedo reclamar rango Donador',
          description: 'Realice la compra por Ko-Fi hace una hora y aun no se refleja en el servidor',
          priority: 'medium',
        });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(202);
      expect(res.body.data.subject).toBe('No puedo reclamar rango Donador');
    });
  });
});
