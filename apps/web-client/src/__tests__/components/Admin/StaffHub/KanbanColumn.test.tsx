import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import KanbanColumn from '@/components/Admin/StaffHub/KanbanColumn';
import { KanbanTask } from '@crystaltides/shared';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/components/Admin/StaffHub/KanbanCard', () => ({
    default: ({ card }: { card: KanbanTask }) => (
        <div data-testid={`kanban-card-${card.id}`}>{card.title}</div>
    ),
}));

describe('KanbanColumn', () => {
    const columnData = {
        id: 'in_progress',
        title: 'En Progreso',
        color: '#3b82f6',
    };

    const sampleCards: KanbanTask[] = [
        {
            id: 10,
            title: 'Configurar Permisos LuckPerms',
            columnId: 'in_progress',
            priority: 'High',
            type: 'Feature',
            created_at: '2026-03-01T00:00:00Z',
        },
    ];

    it('renders column header with count and title collapsed by default', () => {
        // Arrange & Act
        renderWithProviders(
            <KanbanColumn
                column={columnData}
                cards={sampleCards}
                onDragStart={vi.fn()}
                onDrop={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('En Progreso')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.queryByTestId('kanban-card-10')).not.toBeInTheDocument();
    });

    it('expands column when header is clicked, showing cards', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <KanbanColumn
                column={columnData}
                cards={sampleCards}
                onDragStart={vi.fn()}
                onDrop={vi.fn()}
            />
        );

        // Act: click column header
        const header = screen.getByRole('button');
        await user.click(header);

        // Assert: cards are now visible
        expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument();
        expect(screen.getByText('Configurar Permisos LuckPerms')).toBeInTheDocument();
    });

    it('toggles expansion with Enter key on header', async () => {
        // Arrange
        renderWithProviders(
            <KanbanColumn
                column={columnData}
                cards={sampleCards}
                onDragStart={vi.fn()}
                onDrop={vi.fn()}
            />
        );

        const header = screen.getByRole('button');
        header.focus();

        // Act: press enter
        fireEvent.keyDown(header, { key: 'Enter' });

        // Assert
        expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument();

        // Act: press space to collapse
        fireEvent.keyDown(header, { key: ' ' });
        expect(screen.queryByTestId('kanban-card-10')).not.toBeInTheDocument();
    });

    it('renders empty placeholder when expanded and cards array is empty', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <KanbanColumn
                column={columnData}
                cards={[]}
                onDragStart={vi.fn()}
                onDrop={vi.fn()}
            />
        );

        // Act: expand
        await user.click(screen.getByRole('button'));

        // Assert
        expect(screen.getByText('Vacío')).toBeInTheDocument();
    });

    it('handles drag over and drop events', () => {
        // Arrange
        const onDrop = vi.fn();
        const { container } = renderWithProviders(
            <KanbanColumn
                column={columnData}
                cards={sampleCards}
                onDragStart={vi.fn()}
                onDrop={onDrop}
            />
        );

        const columnElement = container.querySelector('.kanban-column');
        expect(columnElement).toBeInTheDocument();

        // Act: drag over auto-expands
        if (columnElement) {
            fireEvent.dragOver(columnElement);
            // Now cards should be visible
            expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument();

            // Drop
            fireEvent.drop(columnElement);
            expect(onDrop).toHaveBeenCalledWith(expect.anything(), 'in_progress');
        }
    });
});
