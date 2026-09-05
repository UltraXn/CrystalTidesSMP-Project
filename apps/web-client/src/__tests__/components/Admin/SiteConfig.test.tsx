import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from '@supabase/supabase-js';
import { renderWithProviders } from '@/utils/test-utils';
import SiteConfig from '@/components/Admin/SiteConfig';

const { mockUseSiteSettings, mockUseUpdateSiteSetting, mockMutate } = vi.hoisted(() => {
    const mockMutate = vi.fn();
    const mockUseSiteSettings = vi.fn();
    const mockUseUpdateSiteSetting = vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
        variables: null,
    }));
    return { mockUseSiteSettings, mockUseUpdateSiteSetting, mockMutate };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/hooks/useAdminData', () => ({
    useSiteSettings: mockUseSiteSettings,
    useUpdateSiteSetting: mockUseUpdateSiteSetting,
}));

vi.mock('@/components/Admin/Config/BroadcastManager', () => ({
    default: () => <div data-testid="broadcast-manager">BroadcastManager</div>,
}));

vi.mock('@/components/Admin/Config/HeroBannerManager', () => ({
    default: () => <div data-testid="hero-banner-manager">HeroBannerManager</div>,
}));

vi.mock('@/components/Admin/Config/RulesEditor', () => ({
    default: () => <div data-testid="rules-editor">RulesEditor</div>,
}));

vi.mock('@/components/Admin/DonorsManager', () => ({
    default: () => <div data-testid="donors-manager">DonorsManager</div>,
}));

vi.mock('@/components/Admin/Config/PoliciesManager', () => ({
    default: () => <div data-testid="policies-manager">PoliciesManager</div>,
}));

describe('SiteConfig', () => {
    const mockAdminUser = {
        id: 'admin-uuid-123',
        email: 'admin@crystaltides.net',
        user_metadata: { full_name: 'Administrator' },
    };

    const initialSettings = {
        theme: 'default',
        maintenance_mode: 'false',
        broadcast_config: '',
        hero_slides: '',
        recruitment_status: 'false',
        recruitment_link: 'https://forms.gle/test',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSiteSettings.mockReturnValue({
            data: initialSettings,
            isLoading: false,
        });
    });

    it('renders loader while site settings are loading', () => {
        // Arrange
        mockUseSiteSettings.mockReturnValue({
            data: null,
            isLoading: true,
        });

        // Act
        renderWithProviders(<SiteConfig />);

        // Assert
        expect(screen.getByAltText('Crystal Tides')).toBeInTheDocument();
    });

    it('renders initial settings for general configuration', () => {
        // Arrange & Act
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Assert
        expect(screen.getByText('admin.settings.theme.title')).toBeInTheDocument();
        expect(screen.getByText('admin.settings.maintenance_label')).toBeInTheDocument();
        expect(screen.getByText('admin.settings.recruitment.title')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://forms.gle/test')).toBeInTheDocument();
    });

    it('changes theme when a theme card is clicked and dispatches themeChanged event', () => {
        // Arrange
        const eventListener = vi.fn();
        window.addEventListener('themeChanged', eventListener);

        mockMutate.mockImplementation((_params: unknown, options?: { onSuccess?: () => void }) => {
            options?.onSuccess?.();
        });

        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act: click Halloween theme
        const halloweenCard = screen.getByRole('button', { name: /admin\.settings\.theme\.halloween/i });
        fireEvent.click(halloweenCard);

        // Assert
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'theme',
                value: 'halloween',
                username: 'Administrator',
                userId: 'admin-uuid-123',
            }),
            expect.any(Object)
        );
        expect(eventListener).toHaveBeenCalled();

        window.removeEventListener('themeChanged', eventListener);
    });

    it('opens confirmation modal when toggling maintenance mode and mutates on confirm', async () => {
        // Arrange
        const user = userEvent.setup();
        const eventListener = vi.fn();
        window.addEventListener('maintenanceChanged', eventListener);

        mockMutate.mockImplementation((_params: unknown, options?: { onSuccess?: () => void }) => {
            options?.onSuccess?.();
        });

        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act: click maintenance toggle checkbox
        const maintenanceToggle = screen.getByLabelText('Alternar modo mantenimiento');
        await user.click(maintenanceToggle);

        // Assert modal appears
        expect(screen.getByText('admin.settings.maintenance_modal.title_on')).toBeInTheDocument();

        // Confirm
        const confirmBtn = screen.getByTestId('confirmation-modal-confirm');
        await user.click(confirmBtn);

        // Assert mutation called
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'maintenance_mode',
                value: 'true',
            }),
            expect.any(Object)
        );
        expect(eventListener).toHaveBeenCalled();

        window.removeEventListener('maintenanceChanged', eventListener);
    });

    it('cancels maintenance modal without mutating', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act: click maintenance toggle
        const maintenanceToggle = screen.getByLabelText('Alternar modo mantenimiento');
        await user.click(maintenanceToggle);

        // Click cancel
        const cancelBtn = screen.getByTestId('confirmation-modal-cancel');
        await user.click(cancelBtn);

        // Assert
        expect(mockMutate).not.toHaveBeenCalled();
        expect(screen.queryByText('admin.settings.maintenance_modal.title_on')).not.toBeInTheDocument();
    });

    it('toggles recruitment status when switch is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act: click recruitment switch
        const recruitmentToggle = screen.getByLabelText('Alternar estado de reclutamiento');
        await user.click(recruitmentToggle);

        // Assert
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'recruitment_status',
                value: 'true',
            }),
            expect.any(Object)
        );
    });

    it('updates recruitment link and saves changes', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act: edit recruitment link input
        const linkInput = screen.getByDisplayValue('https://forms.gle/test');
        await user.clear(linkInput);
        await user.type(linkInput, 'https://forms.gle/new-apply');

        const saveBtn = screen.getByRole('button', { name: 'Guardar enlace de reclutamiento' });
        await user.click(saveBtn);

        // Assert
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'recruitment_link',
                value: 'https://forms.gle/new-apply',
            }),
            expect.any(Object)
        );
    });

    it('expands and collapses accordion sections', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Broadcast section starts closed
        expect(screen.queryByTestId('broadcast-manager')).not.toBeInTheDocument();

        // Act: expand broadcast section
        const broadcastHeader = screen.getByRole('button', { name: /admin\.settings\.sections\.broadcast/i });
        await user.click(broadcastHeader);

        // Assert
        expect(screen.getByTestId('broadcast-manager')).toBeInTheDocument();

        // Act: collapse broadcast section
        await user.click(broadcastHeader);
        expect(screen.queryByTestId('broadcast-manager')).not.toBeInTheDocument();
    });

    it('renders hero, rules, donors and policies sub-managers when sections are opened', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<SiteConfig />, {
            auth: { user: mockAdminUser as unknown as User },
        });

        // Act & Assert: Hero Banner
        const heroHeader = screen.getByRole('button', { name: /admin\.settings\.sections\.hero/i });
        await user.click(heroHeader);
        expect(screen.getByTestId('hero-banner-manager')).toBeInTheDocument();

        // Act & Assert: Rules Editor
        const rulesHeader = screen.getByRole('button', { name: /admin\.settings\.sections\.rules/i });
        await user.click(rulesHeader);
        expect(screen.getByTestId('rules-editor')).toBeInTheDocument();

        // Act & Assert: Donors Manager
        const donorsHeader = screen.getByRole('button', { name: /admin\.settings\.sections\.donors/i });
        await user.click(donorsHeader);
        expect(screen.getByTestId('donors-manager')).toBeInTheDocument();

        // Act & Assert: Policies Manager
        const policiesHeader = screen.getByRole('button', { name: /políticas/i });
        await user.click(policiesHeader);
        expect(screen.getByTestId('policies-manager')).toBeInTheDocument();
    });
});
