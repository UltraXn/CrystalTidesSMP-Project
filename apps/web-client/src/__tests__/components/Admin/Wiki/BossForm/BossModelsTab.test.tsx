import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import { BossModelsTab } from '@/components/Admin/Wiki/BossForm/BossModelsTab';
import { WikiArticle } from '@/services/wikiService';

describe('BossModelsTab', () => {
    const mockFormData: Partial<WikiArticle> = {
        boss_entity_type: 'MythicMobs Plugin',
        boss_mod_name: 'Cataclysm Mod',
        boss_tier: 'Jefe Supremo de Mazmorra',
        model_3d_url: '/models/wither.gltf',
        boss_subtitle: 'MYTHICMOBS • JEFE SUPREMO',
    };

    const defaultProps = {
        formData: mockFormData,
        setFormData: vi.fn(),
        uploadingField: null,
        handleFileUpload: vi.fn().mockResolvedValue(undefined),
    };

    it('renders all model and origin inputs with correct initial values', () => {
        renderWithProviders(<BossModelsTab {...defaultProps} />);

        expect(screen.getByLabelText('Sistema / Origen de Entidad')).toHaveValue('MythicMobs Plugin');
        expect(screen.getByLabelText('Nombre del Mod o Pack')).toHaveValue('Cataclysm Mod');
        expect(screen.getByLabelText('Rango / Tier de Peligro')).toHaveValue('Jefe Supremo de Mazmorra');
        expect(screen.getByLabelText('Modelo 3D Principal / Inicial (.gltf / .glb)')).toHaveValue('/models/wither.gltf');
        expect(screen.getByLabelText('Subtítulo Mítico Banner / Insignia')).toHaveValue('MYTHICMOBS • JEFE SUPREMO');
    });

    it('updates mod name and entity type on user change', async () => {
        const user = userEvent.setup();
        const setFormData = vi.fn();
        renderWithProviders(<BossModelsTab {...defaultProps} setFormData={setFormData} />);

        const modInput = screen.getByLabelText('Nombre del Mod o Pack');
        fireEvent.change(modInput, { target: { value: "Mowzie's Mobs" } });

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_mod_name: "Mowzie's Mobs",
        });

        const entitySelect = screen.getByLabelText('Sistema / Origen de Entidad');
        await user.selectOptions(entitySelect, 'Mod Entity (GeckoLib)');

        expect(setFormData).toHaveBeenCalledWith({
            ...mockFormData,
            boss_entity_type: 'Mod Entity (GeckoLib)',
        });
    });

    it('calls handleFileUpload when a 3D model file is selected', async () => {
        const user = userEvent.setup();
        const handleFileUpload = vi.fn().mockResolvedValue(undefined);
        const { container } = renderWithProviders(
            <BossModelsTab {...defaultProps} handleFileUpload={handleFileUpload} />
        );

        const file = new File(['dummy model data'], 'dragon.gltf', { type: 'model/gltf+json' });
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(fileInput, file);

        expect(handleFileUpload).toHaveBeenCalledWith(file, 'model_3d_url', 'admin-assets');
    });

    it('shows loading state when model file is being uploaded', () => {
        renderWithProviders(<BossModelsTab {...defaultProps} uploadingField="model_3d_url" />);

        expect(screen.getByText('Subiendo...')).toBeInTheDocument();
    });
});
