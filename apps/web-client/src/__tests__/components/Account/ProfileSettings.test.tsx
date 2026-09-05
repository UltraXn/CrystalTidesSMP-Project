import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import ProfileSettings from '@/components/Account/ProfileSettings';
import { renderWithProviders } from '@/utils/test-utils';
import { User } from '@supabase/supabase-js';

vi.mock('@/hooks/useAccountData', () => ({
    useUpdateProfile: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdatePassword: () => ({ mutate: vi.fn(), isPending: false }),
    use2FAStatus: () => ({ data: { enabled: false }, isLoading: false }),
    useSetup2FA: () => ({ mutate: vi.fn(), isPending: false }),
    useEnable2FA: () => ({ mutate: vi.fn(), isPending: false }),
    useDisable2FA: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockUser = {
    id: 'usr-999',
    app_metadata: {},
    user_metadata: {
        bio: 'Aventurero y constructor',
        social_discord: 'alex#1234',
        social_twitter: 'alex_mc',
        social_youtube: 'AlexCraft',
        avatar_preference: 'minecraft',
    },
    created_at: new Date().toISOString(),
} as unknown as User;

describe('ProfileSettings', () => {
    it('renders profile form fields with existing user metadata', () => {
        renderWithProviders(
            <ProfileSettings
                user={mockUser}
                mcUsername="AlexMC"
                showToast={vi.fn()}
            />
        );

        expect(screen.getByDisplayValue('Aventurero y constructor')).toBeInTheDocument();
        expect(screen.getByDisplayValue('alex#1234')).toBeInTheDocument();
        expect(screen.getByDisplayValue('alex_mc')).toBeInTheDocument();
        expect(screen.getByDisplayValue('AlexCraft')).toBeInTheDocument();
    });
});
