import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import PollActiveCard from '@/components/Admin/Polls/PollActiveCard';
import { Poll } from '@/components/Admin/Polls/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null && 'count' in fallbackOrOptions) {
                return `${key} (${fallbackOrOptions.count})`;
            }
            if (typeof fallbackOrOptions === 'string') {
                return fallbackOrOptions;
            }
            return key;
        },
    }),
}));

describe('PollActiveCard', () => {
    const samplePoll: Poll = {
        id: 42,
        title: 'Mejor Modalidad de Juego',
        question: '¿Qué modalidad te gustaría ver en la próxima temporada?',
        closesIn: '3 días',
        totalVotes: 150,
        options: [
            { id: 1, label: 'Survival Custom', percent: 60, votes: 90 },
            { id: 2, label: 'Skyblock RPG', percent: 40, votes: 60 },
        ],
    };

    it('renders empty state when poll is null and triggers onCreate', async () => {
        // Arrange
        const user = userEvent.setup();
        const onCreate = vi.fn();

        renderWithProviders(
            <PollActiveCard
                poll={null}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClose={vi.fn()}
                onCreate={onCreate}
            />
        );

        // Assert
        expect(screen.getByText('admin.polls.no_active')).toBeInTheDocument();
        const createBtn = screen.getByRole('button', { name: 'admin.polls.create_now_btn' });
        expect(createBtn).toBeInTheDocument();

        // Act
        await user.click(createBtn);

        // Assert
        expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it('renders active poll with title, question, options, and votes count', () => {
        // Arrange & Act
        renderWithProviders(
            <PollActiveCard
                poll={samplePoll}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClose={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('Mejor Modalidad de Juego')).toBeInTheDocument();
        expect(screen.getByText('¿Qué modalidad te gustaría ver en la próxima temporada?')).toBeInTheDocument();
        expect(screen.getByText('3 días')).toBeInTheDocument();
        expect(screen.getByText('Survival Custom')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.getByText('90 admin.polls.votes')).toBeInTheDocument();
        expect(screen.getByText('Skyblock RPG')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
        expect(screen.getByText('admin.polls.total_votes (150)')).toBeInTheDocument();
    });

    it('calls onEdit when edit action button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onEdit = vi.fn();

        renderWithProviders(
            <PollActiveCard
                poll={samplePoll}
                onEdit={onEdit}
                onDelete={vi.fn()}
                onClose={vi.fn()}
            />
        );

        // Act
        const editBtn = screen.getByTitle('admin.polls.edit_btn');
        await user.click(editBtn);

        // Assert
        expect(onEdit).toHaveBeenCalledWith(samplePoll);
    });

    it('calls onDelete when delete action button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onDelete = vi.fn();

        renderWithProviders(
            <PollActiveCard
                poll={samplePoll}
                onEdit={vi.fn()}
                onDelete={onDelete}
                onClose={vi.fn()}
            />
        );

        // Act
        const deleteBtn = screen.getByTitle('admin.polls.delete_tooltip');
        await user.click(deleteBtn);

        // Assert
        expect(onDelete).toHaveBeenCalledWith(42);
    });

    it('calls onClose when close poll button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(
            <PollActiveCard
                poll={samplePoll}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClose={onClose}
            />
        );

        // Act
        const closeBtn = screen.getByRole('button', { name: 'admin.polls.close_btn' });
        await user.click(closeBtn);

        // Assert
        expect(onClose).toHaveBeenCalledWith(42);
    });
});
