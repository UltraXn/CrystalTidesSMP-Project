import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import NewsForm from '@/components/Admin/NewsForm';
import { NewsFormValues } from '@/schemas/news';
import { User } from '@supabase/supabase-js';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'mock-jwt-token' } },
            }),
        },
    },
}));

vi.mock('@/services/uploadService', () => ({
    uploadImage: vi.fn().mockResolvedValue('https://example.com/uploaded-news-image.webp'),
}));

describe('NewsForm', () => {
    const mockUser = {
        id: 'user-123',
        email: 'admin@crystaltides.net',
    } as unknown as User;

    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    const sampleInitialData: NewsFormValues = {
        id: 42,
        title: 'Gran Actualización 2.0',
        title_en: 'Major Update 2.0',
        category: 'Update',
        content: 'Detalles extensos sobre los nuevos biomas y sistemas de juego.',
        content_en: 'Extensive details about the new biomes and gameplay systems.',
        status: 'Published',
        image: 'https://example.com/banner.webp',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders create mode with empty default fields and publish button', () => {
        // Arrange & Act
        renderWithProviders(
            <NewsForm
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Assert
        expect(screen.getByText('admin.news.create_title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Escribe un título impactante...')).toHaveValue('');
        expect(screen.getByPlaceholderText('Desarrolla la noticia aquí...')).toHaveValue('');
        expect(screen.getByRole('button', { name: 'admin.news.form.publish' })).toBeInTheDocument();
    });

    it('renders edit mode pre-populated with initialData and save button', () => {
        // Arrange & Act
        renderWithProviders(
            <NewsForm
                initialData={sampleInitialData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Assert
        expect(screen.getByText('admin.news.edit_title')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Gran Actualización 2.0')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Major Update 2.0')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Detalles extensos sobre los nuevos biomas y sistemas de juego.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.news.form.save' })).toBeInTheDocument();
        expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/banner.webp');
    });

    it('shows validation errors when submitting invalid empty form', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <NewsForm
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Act: click publish immediately
        const publishButton = screen.getByRole('button', { name: 'admin.news.form.publish' });
        await user.click(publishButton);

        // Assert
        await waitFor(() => {
            expect(screen.getByText('Title must be at least 5 characters')).toBeInTheDocument();
            expect(screen.getByText('Content must be at least 10 characters')).toBeInTheDocument();
        });
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('submits valid form data successfully and invokes onSave', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = renderWithProviders(
            <NewsForm
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Act: fill valid data
        const titleInput = screen.getByPlaceholderText('Escribe un título impactante...');
        await user.type(titleInput, 'Torneo de Pesca Abisal');

        const contentInput = screen.getByPlaceholderText('Desarrolla la noticia aquí...');
        await user.type(contentInput, 'Todos los sábados a las 18:00 UTC en las costas del servidor.');

        const categorySelect = container.querySelector('#news-form-category') as HTMLSelectElement;
        await user.selectOptions(categorySelect, 'Evento');

        const statusSelect = container.querySelector('#news-form-status') as HTMLSelectElement;
        await user.selectOptions(statusSelect, 'Published');

        const publishButton = screen.getByRole('button', { name: 'admin.news.form.publish' });
        await user.click(publishButton);

        // Assert
        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledTimes(1);
        });

        const submittedData = mockOnSave.mock.calls[0][0] as NewsFormValues;
        expect(submittedData.title).toBe('Torneo de Pesca Abisal');
        expect(submittedData.content).toBe('Todos los sábados a las 18:00 UTC en las costas del servidor.');
        expect(submittedData.category).toBe('Evento');
        expect(submittedData.status).toBe('Published');
    });

    it('triggers onCancel when clicking cancel button', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <NewsForm
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Act: click cancel
        const cancelButtons = screen.getAllByRole('button', { name: 'admin.news.cancel' });
        await user.click(cancelButtons[0]);

        // Assert
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('translates title to English via backend translation API', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                translatedText: 'Abyssal Fishing Tournament',
            }),
        });
        vi.stubGlobal('fetch', mockFetch);

        renderWithProviders(
            <NewsForm
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                user={mockUser}
            />
        );

        // Act: type Spanish title and click translate
        const titleInput = screen.getByPlaceholderText('Escribe un título impactante...');
        await user.type(titleInput, 'Torneo de Pesca');

        const translateBtn = screen.getByRole('button', { name: /admin\.news\.translate_to_en_title/i });
        await user.click(translateBtn);

        // Assert
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/translation'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-jwt-token',
                    }),
                })
            );
            expect(screen.getByDisplayValue('Abyssal Fishing Tournament')).toBeInTheDocument();
        });

        vi.unstubAllGlobals();
    });
});
