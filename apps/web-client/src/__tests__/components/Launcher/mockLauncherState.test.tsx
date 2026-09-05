import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
    AuthProvider,
    useAuth,
    getProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getActiveProfile,
    setActiveProfileId,
    getSettings,
    saveSettings,
    fetchServerStatus,
    fetchNews,
    prettyModName,
    formatModSize,
    resolveProfileGameDir,
} from '@/components/Launcher/mockLauncherState';

describe('mockLauncherState', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('AuthProvider & useAuth', () => {
        it('provides default session and handles guest login and logout', async () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            expect(result.current.currentSession?.username).toBe('Invitado');

            await act(async () => {
                await result.current.loginGuest('Steve');
            });

            expect(result.current.currentSession?.username).toBe('Steve');
            expect(result.current.currentSession?.type).toBe('guest');

            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.currentSession).toBeNull();
        });

        it('handles crystal web session login and logout', async () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.loginCrystal('player@crystaltides.net');
            });

            expect(result.current.crystalSession?.email).toBe('player@crystaltides.net');
            expect(result.current.crystalSession?.username).toBe('player');

            await act(async () => {
                await result.current.logoutCrystal();
            });

            expect(result.current.crystalSession).toBeNull();
        });
    });

    describe('Profiles State Helpers', () => {
        it('retrieves default profiles and active profile', () => {
            const profiles = getProfiles();
            expect(profiles.length).toBeGreaterThanOrEqual(1);

            const active = getActiveProfile();
            expect(active).toBeDefined();
            expect(active.id).toBe('default');
        });

        it('creates, retrieves, updates, and deletes a profile', () => {
            const newProfile = createProfile({
                name: 'Modded 1.21',
                mcVersion: '1.21.1',
            });

            expect(newProfile.name).toBe('Modded 1.21');
            expect(getProfile(newProfile.id)?.name).toBe('Modded 1.21');

            updateProfile(newProfile.id, { name: 'Updated Modded 1.21' });
            expect(getProfile(newProfile.id)?.name).toBe('Updated Modded 1.21');

            setActiveProfileId(newProfile.id);
            expect(getActiveProfile().id).toBe(newProfile.id);

            const deleted = deleteProfile(newProfile.id);
            expect(deleted).toBe(true);
            expect(getProfile(newProfile.id)).toBeUndefined();
        });

        it('resolves game dir correctly', () => {
            expect(resolveProfileGameDir(null)).toBe('~/.crystaltides');
            expect(resolveProfileGameDir({ gameDir: '/custom/mc' } as unknown as Parameters<typeof resolveProfileGameDir>[0])).toBe('/custom/mc');
        });
    });

    describe('Settings Helpers', () => {
        it('retrieves and updates settings', () => {
            const initial = getSettings();
            expect(initial.mcVersion).toBe('1.21.1');

            const updated = saveSettings({ maxRam: 8192, fullscreen: true });
            expect(updated.maxRam).toBe(8192);
            expect(updated.fullscreen).toBe(true);

            expect(getSettings().maxRam).toBe(8192);
        });
    });

    describe('Server Status & News Fetching', () => {
        it('fetches mock server status', async () => {
            const status = await fetchServerStatus();
            expect(status.online).toBe(true);
            expect(status.playersOnline).toBe(100);
        });

        it('fetches mock news list', async () => {
            const news = await fetchNews();
            expect(news.length).toBeGreaterThan(0);
            expect(news[0]).toHaveProperty('title');
        });
    });

    describe('Formatters', () => {
        it('formats mod names and sizes', () => {
            expect(prettyModName('sodium-fabric-0.5.8.jar')).toContain('Sodium');
            expect(formatModSize(1024 * 1024 * 2.5)).toContain('MB');
        });
    });
});
