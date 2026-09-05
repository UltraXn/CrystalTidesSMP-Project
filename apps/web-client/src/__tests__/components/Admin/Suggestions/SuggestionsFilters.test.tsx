import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import SuggestionsFilters from '@/components/Admin/Suggestions/SuggestionsFilters';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('SuggestionsFilters', () => {
    const defaultProps = {
        filterType: 'All',
        setFilterType: vi.fn(),
        filterStatus: 'All',
        setFilterStatus: vi.fn(),
    };

    it('renders heading and all filter buttons', () => {
        renderWithProviders(<SuggestionsFilters {...defaultProps} />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('admin.suggestions.title');
        expect(screen.getByText('Gestione el feedback de la comunidad')).toBeInTheDocument();

        // Type filter buttons
        expect(screen.getByRole('button', { name: 'admin.suggestions.filter_all' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.types.general' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.types.bug' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.types.mod' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.types.complaint' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.types.poll' })).toBeInTheDocument();

        // Status filter buttons
        expect(screen.getByRole('button', { name: 'admin.suggestions.status.all' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.status.pending' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.status.approved' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.suggestions.status.rejected' })).toBeInTheDocument();
    });

    it('indicates active state with aria-pressed', () => {
        renderWithProviders(
            <SuggestionsFilters {...defaultProps} filterType="Bug" filterStatus="pending" />
        );

        const bugBtn = screen.getByRole('button', { name: 'admin.suggestions.types.bug' });
        expect(bugBtn).toHaveAttribute('aria-pressed', 'true');

        const allTypeBtn = screen.getByRole('button', { name: 'admin.suggestions.filter_all' });
        expect(allTypeBtn).toHaveAttribute('aria-pressed', 'false');

        const pendingBtn = screen.getByRole('button', { name: 'admin.suggestions.status.pending' });
        expect(pendingBtn).toHaveAttribute('aria-pressed', 'true');

        const allStatusBtn = screen.getByRole('button', { name: 'admin.suggestions.status.all' });
        expect(allStatusBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls setFilterType when clicking a type filter button', async () => {
        const user = userEvent.setup();
        const setFilterType = vi.fn();
        renderWithProviders(
            <SuggestionsFilters {...defaultProps} setFilterType={setFilterType} />
        );

        const modBtn = screen.getByRole('button', { name: 'admin.suggestions.types.mod' });
        await user.click(modBtn);

        expect(setFilterType).toHaveBeenCalledWith('Mod');
    });

    it('calls setFilterStatus when clicking a status filter button', async () => {
        const user = userEvent.setup();
        const setFilterStatus = vi.fn();
        renderWithProviders(
            <SuggestionsFilters {...defaultProps} setFilterStatus={setFilterStatus} />
        );

        const approvedBtn = screen.getByRole('button', { name: 'admin.suggestions.status.approved' });
        await user.click(approvedBtn);

        expect(setFilterStatus).toHaveBeenCalledWith('approved');
    });
});
