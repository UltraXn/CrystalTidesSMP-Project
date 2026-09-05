import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import PoliciesManager from '@/components/Admin/Config/PoliciesManager';
import { Policy } from '@/hooks/useAdminData';

const {
    mockUsePolicies,
    mockUseUpdatePolicy,
    mockUseTranslateText,
    mockUpdateMutate,
    mockTranslateMutateAsync,
} = vi.hoisted(() => {
    const mockUpdateMutate = vi.fn();
    const mockTranslateMutateAsync = vi.fn();
    const mockUsePolicies = vi.fn();
    const mockUseUpdatePolicy = vi.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    }));
    const mockUseTranslateText = vi.fn(() => ({
        mutateAsync: mockTranslateMutateAsync,
        isPending: false,
    }));

    return {
        mockUsePolicies,
        mockUseUpdatePolicy,
        mockUseTranslateText,
        mockUpdateMutate,
        mockTranslateMutateAsync,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/hooks/useAdminData', () => ({
    usePolicies: mockUsePolicies,
    useUpdatePolicy: mockUseUpdatePolicy,
    useTranslateText: mockUseTranslateText,
}));

describe('PoliciesManager', () => {
    const samplePolicies: Policy[] = [
        {
            id: 1,
            slug: 'privacy',
            title: 'Política de Privacidad',
            content: 'Nos tomamos muy en serio la privacidad de los jugadores.',
            title_en: 'Privacy Policy',
            content_en: 'We take player privacy very seriously.',
            updated_at: '2026-01-01T00:00:00Z',
        },
        {
            id: 2,
            slug: 'terms',
            title: 'Términos de Servicio',
            content: 'Al ingresar al servidor aceptas cumplir todas las normas.',
            title_en: 'Terms of Service',
            content_en: 'By entering the server you agree to comply with all rules.',
            updated_at: '2026-01-01T00:00:00Z',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePolicies.mockReturnValue({
            data: samplePolicies,
            isLoading: false,
        });
    });

    it('renders loader when loading policies without cache', () => {
        // Arrange
        mockUsePolicies.mockReturnValue({
            data: [],
            isLoading: true,
        });

        // Act
        renderWithProviders(<PoliciesManager />);

        // Assert
        expect(screen.getByAltText('Crystal Tides')).toBeInTheDocument();
    });

    it('renders policy selector sidebar and loads default policy', () => {
        // Arrange & Act
        renderWithProviders(<PoliciesManager />);

        // Assert
        expect(screen.getByText('PRIVACY')).toBeInTheDocument();
        expect(screen.getByText('TERMS')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Política de Privacidad')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Nos tomamos muy en serio la privacidad de los jugadores.')).toBeInTheDocument();
    });

    it('switches policy when clicking a different slug button', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<PoliciesManager />);

        // Act: click TERMS
        const termsBtn = screen.getByRole('button', { name: /terms/i });
        await user.click(termsBtn);

        // Assert
        expect(screen.getByDisplayValue('Términos de Servicio')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Al ingresar al servidor aceptas cumplir todas las normas.')).toBeInTheDocument();
    });

    it('switches language tab between Spanish and English', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<PoliciesManager />);

        // Act: click English tab
        const enTab = screen.getByRole('button', { name: /english/i });
        await user.click(enTab);

        // Assert English inputs are visible
        expect(screen.getByDisplayValue('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByDisplayValue('We take player privacy very seriously.')).toBeInTheDocument();
    });

    it('edits policy fields and saves changes', async () => {
        // Arrange
        const user = userEvent.setup();
        mockUpdateMutate.mockImplementation((_params: unknown, options?: { onSuccess?: () => void }) => {
            options?.onSuccess?.();
        });

        renderWithProviders(<PoliciesManager />);

        // Act: modify title and save
        const titleInput = screen.getByDisplayValue('Política de Privacidad');
        await user.clear(titleInput);
        await user.type(titleInput, 'Privacidad de Datos Actualizada');

        const saveBtn = screen.getByRole('button', { name: /guardar cambios/i });
        await user.click(saveBtn);

        // Assert
        expect(mockUpdateMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                slug: 'privacy',
                payload: expect.objectContaining({
                    title: 'Privacidad de Datos Actualizada',
                }),
            }),
            expect.any(Object)
        );
        expect(screen.getByText('Política actualizada con éxito')).toBeInTheDocument();
    });

    it('translates content to English using auto-translate', async () => {
        // Arrange
        const user = userEvent.setup();
        mockTranslateMutateAsync
            .mockResolvedValueOnce('Updated Privacy Policy EN')
            .mockResolvedValueOnce('Updated content in English');

        renderWithProviders(<PoliciesManager />);

        // Switch to English tab where translate button exists
        const enTab = screen.getByRole('button', { name: /english/i });
        await user.click(enTab);

        // Act: click auto-translate
        const translateBtn = screen.getByRole('button', { name: /traducir con ia/i });
        await user.click(translateBtn);

        // Assert
        await waitFor(() => {
            expect(mockTranslateMutateAsync).toHaveBeenCalledTimes(2);
            expect(screen.getByText('Traducido con éxito. Revisa el contenido.')).toBeInTheDocument();
        });
    });

    it('resets form back to original policy values on reset click', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<PoliciesManager />);

        // Act: modify title then click reset
        const titleInput = screen.getByDisplayValue('Política de Privacidad');
        await user.clear(titleInput);
        await user.type(titleInput, 'Texto no deseado');

        const resetBtn = screen.getByRole('button', { name: /restablecer/i });
        await user.click(resetBtn);

        // Assert
        expect(screen.getByDisplayValue('Política de Privacidad')).toBeInTheDocument();
    });
});
