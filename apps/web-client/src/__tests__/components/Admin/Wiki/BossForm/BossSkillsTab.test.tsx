import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import { BossSkillsTab } from '@/components/Admin/Wiki/BossForm/BossSkillsTab';
import { WikiArticle } from '@/services/wikiService';

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => {
    return {
        GLTFLoader: class MockGLTFLoader {
            load(_url: string, onLoad: (gltf: { animations: { name: string }[] }) => void) {
                if (onLoad) {
                    onLoad({ animations: [{ name: 'idle' }, { name: 'smash' }] });
                }
            }
        },
    };
});

vi.mock('@/components/Wiki/WikiBoss3DCard', () => ({
    default: () => <div data-testid="mock-boss-3d-card" />,
}));

describe('BossSkillsTab', () => {
    const mockFormData: Partial<WikiArticle> = {
        boss_phases: [
            {
                phase_number: 1,
                phase_name: 'Fase I: Tormenta',
                model_3d_url: '/models/fase1.gltf',
                hp: '600 HP',
                damage: '35 Daño',
                attacks: [
                    {
                        name: 'Golpe Sísmico',
                        type: 'Melee',
                        damage: '30 Daño',
                        description: 'Genera un temblor en área',
                        animation_clip: 'smash',
                    },
                ],
            },
        ],
    };

    it('renders phase tabs, stats, and attack details', () => {
        const setFormData = vi.fn();
        renderWithProviders(
            <BossSkillsTab formData={mockFormData} setFormData={setFormData} />
        );

        expect(screen.getByRole('button', { name: /Fase I: Tormenta/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Fase I: Tormenta')).toBeInTheDocument();
        expect(screen.getByDisplayValue('600 HP')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Golpe Sísmico')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Genera un temblor en área')).toBeInTheDocument();
    });

    it('allows adding a new phase', async () => {
        const user = userEvent.setup();
        const setFormData = vi.fn();
        renderWithProviders(
            <BossSkillsTab formData={mockFormData} setFormData={setFormData} />
        );

        const addPhaseBtn = screen.getByRole('button', { name: /\+ Añadir Fase/i });
        await user.click(addPhaseBtn);

        expect(setFormData).toHaveBeenCalledWith(
            expect.objectContaining({
                boss_phases: expect.arrayContaining([
                    expect.objectContaining({ phase_number: 1 }),
                    expect.objectContaining({ phase_number: 2, phase_name: 'Fase 2' }),
                ]),
            })
        );
    });

    it('allows adding an attack to the current phase', async () => {
        const user = userEvent.setup();
        const setFormData = vi.fn();
        renderWithProviders(
            <BossSkillsTab formData={mockFormData} setFormData={setFormData} />
        );

        const addAttackBtn = screen.getByRole('button', { name: /\+ Añadir Habilidad/i });
        await user.click(addAttackBtn);

        expect(setFormData).toHaveBeenCalledWith(
            expect.objectContaining({
                boss_phases: expect.arrayContaining([
                    expect.objectContaining({
                        attacks: expect.arrayContaining([
                            expect.objectContaining({ name: 'Golpe Sísmico' }),
                            expect.objectContaining({ name: 'Nueva Habilidad' }),
                        ]),
                    }),
                ]),
            })
        );
    });
});
