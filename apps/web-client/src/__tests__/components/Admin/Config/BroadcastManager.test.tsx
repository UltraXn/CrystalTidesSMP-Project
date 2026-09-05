import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import BroadcastManager from '@/components/Admin/Config/BroadcastManager';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('BroadcastManager', () => {
    const mockOnUpdate = vi.fn();

    const sampleSettings = {
        broadcast_config: JSON.stringify({
            message: 'Mantenimiento del servidor a las 22:00 UTC',
            type: 'alert',
            active: true,
        }),
    };

    it('renders initial broadcast configuration from settings', async () => {
        // Arrange & Act
        renderWithProviders(
            <BroadcastManager
                settings={sampleSettings}
                onUpdate={mockOnUpdate}
                saving={null}
            />
        );

        // Assert
        expect(screen.getByText('admin.settings.broadcast.title')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByDisplayValue('Mantenimiento del servidor a las 22:00 UTC')).toBeInTheDocument();
            expect(screen.getByLabelText('admin.settings.broadcast.active')).toBeChecked();
        });
    });

    it('toggles active switch state', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <BroadcastManager
                settings={sampleSettings}
                onUpdate={mockOnUpdate}
                saving={null}
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText('admin.settings.broadcast.active')).toBeChecked();
        });

        // Act: toggle checkbox off
        const toggle = screen.getByLabelText('admin.settings.broadcast.active');
        await user.click(toggle);

        // Assert: preview shows disabled message
        expect(screen.getByText(/La alerta está desactivada/i)).toBeInTheDocument();
    });

    it('updates broadcast message and changes type to error', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <BroadcastManager
                settings={sampleSettings}
                onUpdate={mockOnUpdate}
                saving={null}
            />
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Mantenimiento del servidor a las 22:00 UTC')).toBeInTheDocument();
        });

        // Act: change message and type
        const messageInput = screen.getByPlaceholderText(/Mantenimiento programado para el Sábado/i);
        await user.clear(messageInput);
        await user.type(messageInput, 'Fallo de conectividad crítico');

        const errorTypeBtn = screen.getByRole('button', { name: /error/i });
        await user.click(errorTypeBtn);

        // Assert preview reflects new message
        expect(screen.getByText('Fallo de conectividad crítico')).toBeInTheDocument();
    });

    it('calls onUpdate with serialized JSON when save button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <BroadcastManager
                settings={sampleSettings}
                onUpdate={mockOnUpdate}
                saving={null}
            />
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Mantenimiento del servidor a las 22:00 UTC')).toBeInTheDocument();
        });

        // Act: click save button
        const saveButton = screen.getByRole('button', { name: /GUARDAR CONFIGURACIÓN/i });
        await user.click(saveButton);

        // Assert
        expect(mockOnUpdate).toHaveBeenCalledWith(
            'broadcast_config',
            expect.stringContaining('Mantenimiento del servidor a las 22:00 UTC')
        );
        const parsedSaved = JSON.parse(mockOnUpdate.mock.calls[0][1]) as { active: boolean; type: string };
        expect(parsedSaved.active).toBe(true);
        expect(parsedSaved.type).toBe('alert');
    });

    it('displays saving spinner when saving is in progress', () => {
        // Arrange & Act
        renderWithProviders(
            <BroadcastManager
                settings={sampleSettings}
                onUpdate={mockOnUpdate}
                saving="broadcast_config"
            />
        );

        // Assert
        expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });
});
