import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as apiService from './apiService';
import { supabase } from './supabaseClient';

// Mock supabase client
vi.mock('./supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn()
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://test.com/asset.png' } }))
            }))
        }
    }
}));

describe('apiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });
        // Mock global fetch
        global.fetch = vi.fn();
    });

    describe('fetchServerResources', () => {
        it('should fetch server resources successfully', async () => {
            const mockData = { players: 10, maxPlayers: 100 };
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => mockData,
            });

            const result = await apiService.fetchServerResources();
            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/server/resources'));
        });

        it('should throw error if fetch fails', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: false,
            });

            await expect(apiService.fetchServerResources()).rejects.toThrow('Failed to fetch server resources');
        });
    });

    describe('fetchStaffList', () => {
        it('should return staff list from data property if available', async () => {
            const mockStaff = [{ id: 1, name: 'Staff 1' }];
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: mockStaff }),
            });

            const result = await apiService.fetchStaffList();
            expect(result).toEqual(mockStaff);
        });

        it('should return empty array if response is not an array', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ unexpected: 'format' }),
            });

            const result = await apiService.fetchStaffList();
            expect(result).toEqual([]);
        });
    });

    describe('getHeaders', () => {
        it('should include auth token in headers if session exists', async () => {
            const mockToken = 'mock-jwt-token';
            (supabase.auth.getSession as Mock).mockResolvedValue({
                data: { session: { access_token: mockToken } }
            });

            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ success: true }),
            });

            // We use fetchTasks as it calls getHeaders internally
            await apiService.fetchTasks();

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });
    });
});
