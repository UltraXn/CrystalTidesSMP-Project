import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import WikiArticleList from '@/components/Admin/Wiki/WikiArticleList';
import { WikiArticle } from '@/services/wikiService';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('WikiArticleList', () => {
    const mockArticles: WikiArticle[] = [
        {
            id: 1,
            author_id: 'admin-1',
            title: 'Wither Boss Guide',
            slug: 'wither-boss-guide',
            category: 'bosses',
            content: 'Detailed strategy for defeating the Wither.',
            created_at: '2026-03-01T00:00:00Z',
            updated_at: '2026-03-01T00:00:00Z',
            boss_mod_name: 'Cataclysm',
            model_3d_url: '/models/wither.gltf',
        },
        {
            id: 2,
            author_id: 'admin-1',
            title: 'Server Commands',
            slug: 'server-commands',
            category: 'comandos',
            content: 'List of all essential player commands.',
            created_at: '2026-03-02T00:00:00Z',
            updated_at: '2026-03-02T00:00:00Z',
        },
    ];

    const defaultProps = {
        articles: mockArticles,
        loading: false,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    it('renders loading state when loading is true', () => {
        renderWithProviders(<WikiArticleList {...defaultProps} loading={true} />);
        expect(screen.getByText('admin.wiki.loading')).toBeInTheDocument();
    });

    it('renders empty message when articles array is empty', () => {
        renderWithProviders(<WikiArticleList {...defaultProps} articles={[]} />);
        expect(screen.getByText('admin.wiki.no_articles')).toBeInTheDocument();
    });

    it('renders article cards with badges and metadata', () => {
        renderWithProviders(<WikiArticleList {...defaultProps} />);

        expect(screen.getByText('Wither Boss Guide')).toBeInTheDocument();
        expect(screen.getByText('/wither-boss-guide')).toBeInTheDocument();
        expect(screen.getByText('Cataclysm')).toBeInTheDocument();
        expect(screen.getByText('3D')).toBeInTheDocument();

        expect(screen.getByText('Server Commands')).toBeInTheDocument();
        expect(screen.getByText('/server-commands')).toBeInTheDocument();
    });

    it('calls onEdit when clicking the edit button', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();

        renderWithProviders(
            <WikiArticleList {...defaultProps} onEdit={onEdit} />
        );

        const editBtn = screen.getByRole('button', { name: 'Editar artículo Wither Boss Guide' });
        await user.click(editBtn);

        expect(onEdit).toHaveBeenCalledWith(mockArticles[0]);
    });

    it('calls onDelete when clicking the delete button', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        renderWithProviders(
            <WikiArticleList {...defaultProps} onDelete={onDelete} />
        );

        const deleteBtn = screen.getByRole('button', { name: 'Eliminar artículo Server Commands' });
        await user.click(deleteBtn);

        expect(onDelete).toHaveBeenCalledWith(2);
    });
});
