import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import StaffList from '@/components/Admin/Staff/StaffList';
import { StaffCardData } from '@/components/Admin/Staff/StaffFormModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
        children({
            droppableProps: {},
            innerRef: vi.fn(),
            placeholder: null,
        }),
    Draggable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
        children({
            draggableProps: { style: {} },
            dragHandleProps: {},
            innerRef: vi.fn(),
        }),
}));

vi.mock('@/components/Admin/StaffCard', () => ({
    default: ({
        data,
        onEdit,
        onDelete,
    }: {
        data: StaffCardData;
        onEdit: () => void;
        onDelete: () => void;
    }) => (
        <div data-testid={`staff-card-${data.name}`}>
            <span>{data.name}</span>
            <span>{data.role}</span>
            <button type="button" onClick={onEdit}>Editar {data.name}</button>
            <button type="button" onClick={onDelete}>Eliminar {data.name}</button>
        </div>
    ),
}));

describe('StaffList', () => {
    const sampleCards: StaffCardData[] = [
        {
            id: 1,
            name: 'Neroferno',
            role: 'Admin',
            color: '#ef4444',
            description: 'Server Founder',
            image: '',
        },
        {
            id: 2,
            name: 'Killuwu',
            role: 'Developer',
            color: '#0ea5e9',
            description: 'Core Dev',
            image: '',
        },
    ];

    it('renders empty state when cards array is empty', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffList
                cards={[]}
                onlineStatus={{}}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSync={vi.fn()}
                onAdd={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('admin.staff.empty')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.staff.sync_btn' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.staff.add_manual' })).toBeInTheDocument();
    });

    it('calls onSync and onAdd from empty state buttons', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSync = vi.fn();
        const onAdd = vi.fn();

        renderWithProviders(
            <StaffList
                cards={[]}
                onlineStatus={{}}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSync={onSync}
                onAdd={onAdd}
            />
        );

        // Act & Assert sync
        await user.click(screen.getByRole('button', { name: 'admin.staff.sync_btn' }));
        expect(onSync).toHaveBeenCalledTimes(1);

        // Act & Assert add
        await user.click(screen.getByRole('button', { name: 'admin.staff.add_manual' }));
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('shows syncing text and disables button when syncing is true', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffList
                cards={[]}
                onlineStatus={{}}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                syncing={true}
            />
        );

        // Assert
        const syncBtn = screen.getByRole('button', { name: /admin\.staff\.syncing/i });
        expect(syncBtn).toBeDisabled();
    });

    it('renders cards and triggers onEdit and onDelete callbacks', async () => {
        // Arrange
        const user = userEvent.setup();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        renderWithProviders(
            <StaffList
                cards={sampleCards}
                onlineStatus={{}}
                onDragEnd={vi.fn()}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        // Assert rendered cards
        expect(screen.getByTestId('staff-card-Neroferno')).toBeInTheDocument();
        expect(screen.getByTestId('staff-card-Killuwu')).toBeInTheDocument();

        // Act: edit Neroferno
        await user.click(screen.getByRole('button', { name: 'Editar Neroferno' }));
        expect(onEdit).toHaveBeenCalledWith(sampleCards[0]);

        // Act: delete Killuwu
        await user.click(screen.getByRole('button', { name: 'Eliminar Killuwu' }));
        expect(onDelete).toHaveBeenCalledWith(2);
    });
});
