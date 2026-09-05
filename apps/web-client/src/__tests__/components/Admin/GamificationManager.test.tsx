import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import GamificationManager from '@/components/Admin/GamificationManager';

const { mockUseAdminSettings, mockUseUpdateSiteSetting, mockMutate } = vi.hoisted(() => {
    const mockMutate = vi.fn();
    const mockUseAdminSettings = vi.fn();
    const mockUseUpdateSiteSetting = vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    }));
    return { mockUseAdminSettings, mockUseUpdateSiteSetting, mockMutate };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/hooks/useAdminData', () => ({
    useAdminSettings: mockUseAdminSettings,
    useUpdateSiteSetting: mockUseUpdateSiteSetting,
}));

vi.mock('@/components/UI/ImageUploader', () => ({
    default: ({ onImageUploaded }: { onImageUploaded: (url: string) => void }) => (
        <div data-testid="image-uploader">
            <button
                type="button"
                data-testid="upload-trigger"
                onClick={() => onImageUploaded('https://example.com/new-image.png')}
            >
                Upload Image
            </button>
        </div>
    ),
}));

describe('GamificationManager', () => {
    const initialMedals = [
        {
            id: 1,
            name: 'Medalla de Oro',
            description: 'Otorgada por valentía',
            icon: 'medal',
            color: '#ffd700',
            image_url: 'https://example.com/gold.png',
        },
        {
            id: 2,
            name: 'Medalla de Plata',
            description: 'Segundo lugar en torneo',
            icon: 'shield',
            color: '#c0c0c0',
        },
    ];

    const initialAchievements = [
        {
            id: 'ach_1',
            name: 'Primer Logro',
            description: 'Completar el tutorial inicial',
            criteria: 'Llegar al nivel 5',
            icon: '⭐',
            image_url: 'https://example.com/star.png',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAdminSettings.mockReturnValue({
            data: {
                medals: initialMedals,
                achievements: initialAchievements,
            },
            isLoading: false,
        });
    });

    it('renders loader when loading settings', () => {
        // Arrange
        mockUseAdminSettings.mockReturnValue({
            data: null,
            isLoading: true,
        });

        // Act
        renderWithProviders(<GamificationManager />);

        // Assert
        expect(screen.getByAltText('Crystal Tides')).toBeInTheDocument();
    });

    it('renders medals grid by default with medal titles and descriptions', () => {
        // Arrange & Act
        renderWithProviders(<GamificationManager />);

        // Assert
        expect(screen.getByRole('tab', { name: /admin\.gamification\.medals_tab/i })).toHaveClass('active');
        expect(screen.getByDisplayValue('Medalla de Oro')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Otorgada por valentía')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Medalla de Plata')).toBeInTheDocument();
    });

    it('switches to achievements tab and renders achievements list', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act
        const achievementsTab = screen.getByRole('tab', { name: /admin\.gamification\.achievements_tab/i });
        await user.click(achievementsTab);

        // Assert
        expect(achievementsTab).toHaveClass('active');
        expect(screen.getByDisplayValue('Primer Logro')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Completar el tutorial inicial')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Llegar al nivel 5')).toBeInTheDocument();
    });

    it('adds a new medal when add button is clicked on medals tab', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act
        const addMedalBtn = screen.getByRole('button', { name: /admin\.gamification\.add_medal/i });
        await user.click(addMedalBtn);

        // Assert
        expect(mockMutate).toHaveBeenCalledTimes(1);
        const mutationArg = mockMutate.mock.calls[0][0] as { key: string; value: string };
        expect(mutationArg.key).toBe('medal_definitions');
        const parsedList = JSON.parse(mutationArg.value) as unknown[];
        expect(parsedList).toHaveLength(initialMedals.length + 1);
    });

    it('adds a new achievement when add button is clicked on achievements tab', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act: switch tab and add
        const achievementsTab = screen.getByRole('tab', { name: /admin\.gamification\.achievements_tab/i });
        await user.click(achievementsTab);

        const addAchievementBtn = screen.getByRole('button', { name: /admin\.gamification\.add_achievement/i });
        await user.click(addAchievementBtn);

        // Assert
        expect(mockMutate).toHaveBeenCalledTimes(1);
        const mutationArg = mockMutate.mock.calls[0][0] as { key: string; value: string };
        expect(mutationArg.key).toBe('achievement_definitions');
        const parsedList = JSON.parse(mutationArg.value) as unknown[];
        expect(parsedList).toHaveLength(initialAchievements.length + 1);
    });

    it('allows editing a medal and saving modifications', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act: click edit on first medal
        const editButtons = screen.getAllByRole('button', { name: 'Editar medalla' });
        await user.click(editButtons[0]);

        // Input should now be editable
        const nameInput = screen.getByDisplayValue('Medalla de Oro');
        await user.clear(nameInput);
        await user.type(nameInput, 'Medalla de Platino Suprema');

        // Save
        const saveButton = screen.getByRole('button', { name: 'Guardar medalla' });
        await user.click(saveButton);

        // Assert
        expect(mockMutate).toHaveBeenCalledTimes(1);
        const mutationArg = mockMutate.mock.calls[0][0] as { key: string; value: string };
        expect(mutationArg.key).toBe('medal_definitions');
        const updatedList = JSON.parse(mutationArg.value) as Array<{ id: number; name: string }>;
        expect(updatedList[0].name).toBe('Medalla de Platino Suprema');
    });

    it('translates medal fields using auto-translate during edit', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockFetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('Medalla')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ responseData: { translatedText: 'Gold Medal' } }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ responseData: { translatedText: 'Awarded for bravery' } }),
            });
        });
        vi.stubGlobal('fetch', mockFetch);

        renderWithProviders(<GamificationManager />);

        // Act: edit first medal
        const editButtons = screen.getAllByRole('button', { name: 'Editar medalla' });
        await user.click(editButtons[0]);

        const autoTranslateBtn = screen.getByRole('button', { name: 'Traducir medalla automáticamente al inglés' });
        await user.click(autoTranslateBtn);

        // Assert
        await waitFor(() => {
            expect(screen.getByDisplayValue('Gold Medal')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Awarded for bravery')).toBeInTheDocument();
        });

        vi.unstubAllGlobals();
    });

    it('handles delete flow: opens confirmation modal and confirms medal deletion', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act: click delete on first medal
        const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar medalla' });
        await user.click(deleteButtons[0]);

        // Assert modal is visible
        const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
        expect(confirmBtn).toBeInTheDocument();

        // Confirm delete
        await user.click(confirmBtn);

        // Assert mutation called without first medal
        expect(mockMutate).toHaveBeenCalledTimes(1);
        const mutationArg = mockMutate.mock.calls[0][0] as { key: string; value: string };
        expect(mutationArg.key).toBe('medal_definitions');
        const remainingList = JSON.parse(mutationArg.value) as Array<{ id: number }>;
        expect(remainingList).toHaveLength(1);
        expect(remainingList[0].id).toBe(2);
    });

    it('cancels deletion when cancel button in modal is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(<GamificationManager />);

        // Act: click delete then cancel
        const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar medalla' });
        await user.click(deleteButtons[0]);

        const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
        await user.click(cancelBtn);

        // Assert mutation not called
        expect(mockMutate).not.toHaveBeenCalled();
    });
});
