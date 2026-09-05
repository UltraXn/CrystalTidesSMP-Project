import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import { BossStatsTab } from '@/components/Admin/Wiki/BossForm/BossStatsTab';
import { WikiArticle } from '@/services/wikiService';

describe('BossStatsTab', () => {
    const mockFormData: Partial<WikiArticle> = {
        boss_hp: '600 HP',
        boss_hp_phase_2: '800 HP',
        boss_damage: '35 Daño',
        boss_damage_phase_2: '50 Daño Crítico',
        boss_armor: '1.0 Resistencia',
        boss_speed: 'MovementSpeed 0.2',
        boss_immunities: ['Inmune a Fuego', 'Resistencia a Magia'],
    };

    it('renders all combat stat inputs with initial values', () => {
        const setFormData = vi.fn();
        renderWithProviders(
            <BossStatsTab formData={mockFormData} setFormData={setFormData} />
        );

        expect(screen.getByLabelText('Salud Fase 1 (HP)')).toHaveValue('600 HP');
        expect(screen.getByLabelText('Salud Fase 2 (Enfurecido)')).toHaveValue('800 HP');
        expect(screen.getByLabelText('Daño Base Fase 1')).toHaveValue('35 Daño');
        expect(screen.getByLabelText('Daño Crítico Fase 2')).toHaveValue('50 Daño Crítico');
        expect(screen.getByLabelText('Resistencia / Escudo Knockback')).toHaveValue('1.0 Resistencia');
        expect(screen.getByLabelText('Velocidad & Rango de Agresión')).toHaveValue('MovementSpeed 0.2');
        expect(screen.getByLabelText(/Inmunidades & Protecciones Especiales/i)).toHaveValue('Inmune a Fuego, Resistencia a Magia');
    });

    it('updates HP and damage values on user input', () => {
        const setFormData = vi.fn();
        renderWithProviders(
            <BossStatsTab formData={mockFormData} setFormData={setFormData} />
        );

        const hpInput = screen.getByLabelText('Salud Fase 1 (HP)');
        fireEvent.change(hpInput, { target: { value: '1200 HP' } });

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_hp: '1200 HP',
        });
    });

    it('updates immunities list by comma separated string', () => {
        const setFormData = vi.fn();
        renderWithProviders(
            <BossStatsTab formData={mockFormData} setFormData={setFormData} />
        );

        const immunitiesInput = screen.getByLabelText(/Inmunidades & Protecciones Especiales/i);
        fireEvent.change(immunitiesInput, { target: { value: 'Veneno, Explosiones' } });

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_immunities: ['Veneno', 'Explosiones'],
        });
    });
});
