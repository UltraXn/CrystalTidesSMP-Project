import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import { BossMediaTab } from '@/components/Admin/Wiki/BossForm/BossMediaTab';
import { WikiArticle } from '@/services/wikiService';

describe('BossMediaTab', () => {
    const mockFormData: Partial<WikiArticle> = {
        boss_location: 'Nether / Mazmorra Olvidada',
        boss_spawn_method: 'Altar Wither + 3 Almas',
        boss_spawn_command: '/mm mobs spawn ToroWither',
        boss_kc_reward: 4500,
        boss_drops: ['Nether Star', 'Cráneo Ancestral'],
        boss_music_url: '/audio/boss_theme.ogg',
        boss_sound_spawn: '/audio/roar.ogg',
    };

    const defaultProps = {
        formData: mockFormData,
        setFormData: vi.fn(),
        uploadingField: null,
        handleFileUpload: vi.fn().mockResolvedValue(undefined),
    };

    it('renders all media, spawn and audio inputs with correct values', () => {
        renderWithProviders(<BossMediaTab {...defaultProps} />);

        expect(screen.getByLabelText('Hábitat / Dimensión / Mazmorra')).toHaveValue('Nether / Mazmorra Olvidada');
        expect(screen.getByLabelText('Método de Aparición / Ritual')).toHaveValue('Altar Wither + 3 Almas');
        expect(screen.getByLabelText('Comando de Invocación Staff / Admin')).toHaveValue('/mm mobs spawn ToroWither');
        expect(screen.getByLabelText('Recompensa de Monedas / KC Reward')).toHaveValue(4500);
        expect(screen.getByLabelText(/Catálogo de Drops & Botín de Caza/i)).toHaveValue('Nether Star, Cráneo Ancestral');
        expect(screen.getByLabelText(/Música de Fondo \/ Tema de Combate/i)).toHaveValue('/audio/boss_theme.ogg');
        expect(screen.getByLabelText('Líneas de Voz / Rugidos Míticos')).toHaveValue('/audio/roar.ogg');
    });

    it('updates text and number inputs on change', () => {
        const setFormData = vi.fn();
        renderWithProviders(<BossMediaTab {...defaultProps} setFormData={setFormData} />);

        const locationInput = screen.getByLabelText('Hábitat / Dimensión / Mazmorra');
        fireEvent.change(locationInput, { target: { value: 'The End Island' } });

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_location: 'The End Island',
        });

        const kcInput = screen.getByLabelText('Recompensa de Monedas / KC Reward');
        fireEvent.change(kcInput, { target: { value: '6000' } });

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_kc_reward: 6000,
        });
    });

    it('handles audio file upload', async () => {
        const user = userEvent.setup();
        const handleFileUpload = vi.fn().mockResolvedValue(undefined);
        const { container } = renderWithProviders(
            <BossMediaTab {...defaultProps} handleFileUpload={handleFileUpload} />
        );

        const file = new File(['dummy audio'], 'theme.ogg', { type: 'audio/ogg' });
        const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');

        await user.upload(fileInputs[0], file);

        expect(handleFileUpload).toHaveBeenCalledWith(file, 'boss_music_url', 'audio');
    });
});
