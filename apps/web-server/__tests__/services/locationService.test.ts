import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as locationService from '../../services/locationService.js';
import supabase from '../../services/supabaseService.js';

describe('LocationService Unit Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllLocations', () => {
    it('queries world_locations ordered by sort_order ascending', async () => {
      // Arrange
      const mockLocations = [
        { id: 1, title: 'Spawn Central', sort_order: 1 },
        { id: 2, title: 'Mercado Abisal', sort_order: 2 },
      ];

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: mockLocations, error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const result = await locationService.getAllLocations();

      // Assert
      expect(result).toEqual(mockLocations);
      expect(supabase.from).toHaveBeenCalledWith('world_locations');
    });

    it('throws error when database query fails', async () => {
      // Arrange
      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('DB Connection Lost') }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act & Assert
      await expect(locationService.getAllLocations()).rejects.toThrow('DB Connection Lost');
    });
  });

  describe('createLocation', () => {
    it('inserts location payload and returns created record', async () => {
      // Arrange
      const newPayload = {
        title: 'Torre del Tiempo',
        description: 'Observatorio astral',
        long_description: 'Descripción detallada',
        coords: '500, 120, -800',
        image_url: null,
        is_coming_soon: true,
        authors: [{ name: 'NachoDev', role: 'Architect' }],
        sort_order: 5,
      };

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: { id: 10, ...newPayload }, error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const result = await locationService.createLocation(newPayload);

      // Assert
      expect(result.id).toBe(10);
      expect(result.title).toBe('Torre del Tiempo');
    });
  });

  describe('deleteLocation', () => {
    it('deletes location by id', async () => {
      // Arrange
      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      await locationService.deleteLocation(10);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('world_locations');
    });
  });
});
