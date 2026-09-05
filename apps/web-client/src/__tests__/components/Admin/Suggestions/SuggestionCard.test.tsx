import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import SuggestionCard from '@/components/Admin/Suggestions/SuggestionCard';
import { Suggestion } from '@/components/Admin/Suggestions/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('SuggestionCard', () => {
    const mockSuggestion: Suggestion = {
        id: 1,
        nickname: 'PlayerOne',
        type: 'General',
        message: 'This is a test suggestion message for the server.',
        status: 'pending',
        created_at: '2026-03-01T12:00:00Z',
    };

    const defaultProps = {
        suggestion: mockSuggestion,
        isExpanded: false,
        onToggleExpand: vi.fn(),
        onUpdateStatus: vi.fn(),
        onDelete: vi.fn(),
    };

    it('renders suggestion details correctly', () => {
        renderWithProviders(<SuggestionCard {...defaultProps} />);

        expect(screen.getByText('PlayerOne')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'PlayerOne' })).toHaveAttribute(
            'src',
            'https://mc-heads.net/avatar/PlayerOne/64'
        );
        expect(screen.getByText('This is a test suggestion message for the server.')).toBeInTheDocument();
        expect(screen.getByText('admin.suggestions.status.pending')).toBeInTheDocument();
    });

    it('handles message expansion button when text is longer than 100 characters', async () => {
        const user = userEvent.setup();
        const onToggleExpand = vi.fn();
        const longMessage = 'A'.repeat(120);
        const longSuggestion: Suggestion = {
            ...mockSuggestion,
            message: longMessage,
        };

        const { rerender } = renderWithProviders(
            <SuggestionCard
                {...defaultProps}
                suggestion={longSuggestion}
                isExpanded={false}
                onToggleExpand={onToggleExpand}
            />
        );

        const readMoreBtn = screen.getByRole('button', { name: 'Leer más' });
        expect(readMoreBtn).toBeInTheDocument();
        await user.click(readMoreBtn);
        expect(onToggleExpand).toHaveBeenCalledTimes(1);

        rerender(
            <SuggestionCard
                {...defaultProps}
                suggestion={longSuggestion}
                isExpanded={true}
                onToggleExpand={onToggleExpand}
            />
        );
        expect(screen.getByRole('button', { name: 'Ver menos' })).toBeInTheDocument();
    });

    it('calls onUpdateStatus with "approved" when clicking approve button', async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();
        renderWithProviders(
            <SuggestionCard {...defaultProps} onUpdateStatus={onUpdateStatus} />
        );

        const approveBtn = screen.getByRole('button', { name: /Aprobar sugerencia de PlayerOne/i });
        await user.click(approveBtn);

        expect(onUpdateStatus).toHaveBeenCalledWith(1, 'approved');
    });

    it('calls onUpdateStatus with "rejected" when clicking reject button', async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();
        renderWithProviders(
            <SuggestionCard {...defaultProps} onUpdateStatus={onUpdateStatus} />
        );

        const rejectBtn = screen.getByRole('button', { name: /Rechazar sugerencia de PlayerOne/i });
        await user.click(rejectBtn);

        expect(onUpdateStatus).toHaveBeenCalledWith(1, 'rejected');
    });

    it('calls onDelete when clicking delete button', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWithProviders(
            <SuggestionCard {...defaultProps} onDelete={onDelete} />
        );

        const deleteBtn = screen.getByRole('button', { name: /Eliminar sugerencia de PlayerOne/i });
        await user.click(deleteBtn);

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('hides approve button when already approved or implemented', () => {
        const approvedSuggestion: Suggestion = { ...mockSuggestion, status: 'approved' };
        renderWithProviders(<SuggestionCard {...defaultProps} suggestion={approvedSuggestion} />);

        expect(screen.queryByRole('button', { name: /Aprobar sugerencia/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Rechazar sugerencia/i })).toBeInTheDocument();
    });

    it('hides reject button when already rejected', () => {
        const rejectedSuggestion: Suggestion = { ...mockSuggestion, status: 'rejected' };
        renderWithProviders(<SuggestionCard {...defaultProps} suggestion={rejectedSuggestion} />);

        expect(screen.queryByRole('button', { name: /Rechazar sugerencia/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Aprobar sugerencia/i })).toBeInTheDocument();
    });
});
