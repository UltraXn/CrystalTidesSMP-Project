import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ticketService from '../../services/ticketService.js';
import supabase from '../../services/supabaseService.js';

describe('TicketService Unit Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTickets', () => {
    it('fetches tickets ordered by created_at descending', async () => {
      // Arrange
      const mockTickets = [
        { id: 1, subject: 'Bug de spawn', status: 'open', created_at: '2026-09-05T01:00:00Z' },
        { id: 2, subject: 'Duda de rango', status: 'resolved', created_at: '2026-09-04T12:00:00Z' },
      ];

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: mockTickets, error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const tickets = await ticketService.getAllTickets();

      // Assert
      expect(tickets).toEqual(mockTickets);
      expect(supabase.from).toHaveBeenCalledWith('tickets');
    });
  });

  describe('getTicketById', () => {
    it('fetches a single ticket by id', async () => {
      // Arrange
      const mockTicket = { id: 42, subject: 'Consulta', status: 'open' };

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockTicket, error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const ticket = await ticketService.getTicketById(42);

      // Assert
      expect(ticket).toEqual(mockTicket);
    });
  });

  describe('createTicket', () => {
    it('inserts a ticket with default status open and priority medium', async () => {
      // Arrange
      const userId = 'user-uuid-99';
      const ticketInput = {
        subject: 'No puedo reclamar recompensa diaria',
        description: 'Al hacer clic en el botón sale error 500',
      };

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { id: 101, user_id: userId, ...ticketInput, priority: 'medium', status: 'open' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const created = await ticketService.createTicket(userId, ticketInput);

      // Assert
      expect(created.id).toBe(101);
      expect(created.user_id).toBe(userId);
      expect(created.status).toBe('open');
      expect(created.priority).toBe('medium');
    });
  });
});
