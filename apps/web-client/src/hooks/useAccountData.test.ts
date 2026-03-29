import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useAccountSettings, usePlayerStats } from './useAccountData';
import { renderHookWithProviders } from '../utils/test-utils';

describe('useAccountData hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    describe('useAccountSettings', () => {
        it('should fetch and parse settings correctly', async () => {
            const mockSettings = {
                medal_definitions: JSON.stringify([{ id: 'm1', name: 'Medal 1' }]),
                achievement_definitions: JSON.stringify([{ id: 'a1', name: 'Achievement 1' }]),
            };

            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockSettings,
            });

            const { result } = renderHookWithProviders(() => useAccountSettings());

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual({
                medal_definitions: [{ id: 'm1', name: 'Medal 1' }],
                achievement_definitions: [{ id: 'a1', name: 'Achievement 1' }],
            });
        });

        it('should handle fetch errors', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
            });

            const { result } = renderHookWithProviders(() => useAccountSettings());

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    describe('usePlayerStats', () => {
        it('should fetch player stats when enabled and uuid is provided', async () => {
            const mockStats = { level: 10, kills: 50 };
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ success: true, data: mockStats }),
            });

            const { result } = renderHookWithProviders(() => usePlayerStats('test-uuid', true));

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockStats);
        });

        it('should not fetch when disabled', async () => {
            const { result } = renderHookWithProviders(() => usePlayerStats('test-uuid', false));

            expect(result.current.fetchStatus).toBe('idle');
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});
