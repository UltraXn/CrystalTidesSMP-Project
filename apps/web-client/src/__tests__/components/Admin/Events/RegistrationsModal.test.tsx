import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import RegistrationsModal from '@/components/Admin/Events/RegistrationsModal';
import { Registration } from '@/components/Admin/Events/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'mock-token' } },
            }),
        },
    },
}));

vi.mock('@/services/adminAuth', () => ({
    getAuthHeaders: vi.fn(() => ({ Authorization: 'Bearer mock-token' })),
}));

describe('RegistrationsModal', () => {
    const sampleRegistrations: Registration[] = [
        {
            id: 1,
            created_at: '2026-03-01T10:00:00Z',
            profiles: {
                username: 'EpicPlayer',
                avatar_url: 'https://example.com/epic.png',
            },
        },
        {
            id: 2,
            created_at: '2026-03-02T10:00:00Z',
            profiles: {
                username: undefined,
                avatar_url: undefined,
            },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('fetches registrations from API when mockRegistrations is not provided', async () => {
        // Arrange
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => sampleRegistrations,
        });

        // Act
        renderWithProviders(
            <RegistrationsModal
                eventId={5}
                onClose={vi.fn()}
                API_URL="/api"
            />
        );

        // Assert loading state
        expect(screen.getByText('admin.events.registrations.loading')).toBeInTheDocument();

        // Assert fetched registrations
        await waitFor(() => {
            expect(screen.getByText('EpicPlayer')).toBeInTheDocument();
            expect(screen.getByText('admin.events.registrations.unknown_user')).toBeInTheDocument();
            expect(screen.getByText('(2)')).toBeInTheDocument();
        });
    });

    it('renders provided mockRegistrations immediately without API fetch', () => {
        // Arrange & Act
        renderWithProviders(
            <RegistrationsModal
                eventId={5}
                onClose={vi.fn()}
                API_URL="/api"
                mockRegistrations={sampleRegistrations}
            />
        );

        // Assert
        expect(global.fetch).not.toHaveBeenCalled();
        expect(screen.getByText('EpicPlayer')).toBeInTheDocument();
        expect(screen.getByAltText('avatar')).toHaveAttribute('src', 'https://example.com/epic.png');
        expect(screen.getByText('CT')).toBeInTheDocument();
    });

    it('renders empty registrations state when list is empty', () => {
        // Arrange & Act
        renderWithProviders(
            <RegistrationsModal
                eventId={5}
                onClose={vi.fn()}
                API_URL="/api"
                mockRegistrations={[]}
            />
        );

        // Assert
        expect(screen.getByText('admin.events.registrations.empty')).toBeInTheDocument();
        expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    it('calls onClose when close buttons are clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(
            <RegistrationsModal
                eventId={5}
                onClose={onClose}
                API_URL="/api"
                mockRegistrations={sampleRegistrations}
            />
        );

        // Act: click header close
        const closeBtn = screen.getByRole('button', { name: /cerrar ventana/i });
        await user.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        // Act: click bottom close
        const bottomBtn = screen.getByRole('button', { name: 'Cerrar' });
        await user.click(bottomBtn);
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});
