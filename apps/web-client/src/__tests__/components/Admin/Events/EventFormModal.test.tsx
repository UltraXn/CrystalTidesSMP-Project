import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import EventFormModal from '@/components/Admin/Events/EventFormModal';
import { Event } from '@/components/Admin/Events/types';

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

describe('EventFormModal', () => {
    const sampleEvent: Event = {
        id: 10,
        title: 'Torneo de Pesca',
        title_en: 'Fishing Tournament',
        description: 'Gran competencia marítima',
        description_en: 'Grand maritime competition',
        type: 'hammer',
        status: 'active',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders edit mode header when currentEvent has an id', () => {
        // Arrange & Act
        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={sampleEvent}
                setCurrentEvent={vi.fn()}
                API_URL="/api"
            />
        );

        // Assert
        expect(screen.getByText('admin.events.edit_title')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'admin.events.form_extras.title_es' })).toHaveValue('Torneo de Pesca');
        expect(screen.getByRole('combobox', { name: 'admin.events.form.type' })).toHaveValue('hammer');
        expect(screen.getByRole('combobox', { name: 'admin.events.form.status' })).toHaveValue('active');
    });

    it('renders create mode header when currentEvent has no id', () => {
        // Arrange & Act
        const newEvent: Event = {
            title: '',
            description: '',
            type: 'dice',
            status: 'soon',
        };

        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={newEvent}
                setCurrentEvent={vi.fn()}
                API_URL="/api"
            />
        );

        // Assert
        expect(screen.getByText('admin.events.create_title')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /admin\.events\.form\.create/i })).toBeInTheDocument();
    });

    it('triggers setCurrentEvent when inputs change', async () => {
        // Arrange
        const user = userEvent.setup();
        const setCurrentEvent = vi.fn();

        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={sampleEvent}
                setCurrentEvent={setCurrentEvent}
                API_URL="/api"
            />
        );

        // Act: change title
        const titleInput = screen.getByRole('textbox', { name: 'admin.events.form_extras.title_es' });
        await user.type(titleInput, '!');

        // Assert
        expect(setCurrentEvent).toHaveBeenCalled();
    });

    it('translates title and description via API translation service', async () => {
        // Arrange
        const user = userEvent.setup();
        const setCurrentEvent = vi.fn();
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ translatedText: 'Translated Title EN' }),
        });

        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={sampleEvent}
                setCurrentEvent={setCurrentEvent}
                API_URL="/api"
            />
        );

        // Act: click translate title button
        const translateBtns = screen.getAllByRole('button', { name: /admin\.events\.form_extras\.translate_btn/i });
        await user.click(translateBtns[0]);

        // Assert
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/translation',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ text: 'Torneo de Pesca', targetLang: 'en' }),
                })
            );
            expect(setCurrentEvent).toHaveBeenCalled();
        });
    });

    it('calls onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(
            <EventFormModal
                onClose={onClose}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={sampleEvent}
                setCurrentEvent={vi.fn()}
                API_URL="/api"
            />
        );

        // Act: click cancel
        const cancelButtons = screen.getAllByRole('button', { name: 'admin.events.cancel' });
        await user.click(cancelButtons[0]);

        // Assert
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('submits form on submit button click', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSave = vi.fn().mockImplementation((e: React.FormEvent) => {
            e.preventDefault();
            return Promise.resolve();
        });

        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={onSave}
                currentEvent={sampleEvent}
                setCurrentEvent={vi.fn()}
                API_URL="/api"
            />
        );

        // Act
        const submitBtn = screen.getByRole('button', { name: /admin\.events\.form\.save/i });
        await user.click(submitBtn);

        // Assert
        expect(onSave).toHaveBeenCalled();
    });

    it('disables submit button when saving is true', () => {
        // Arrange & Act
        renderWithProviders(
            <EventFormModal
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                currentEvent={sampleEvent}
                setCurrentEvent={vi.fn()}
                API_URL="/api"
                saving={true}
            />
        );

        // Assert
        const submitBtn = screen.getByRole('button', { name: '' });
        expect(submitBtn).toBeDisabled();
    });
});
