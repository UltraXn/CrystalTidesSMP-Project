import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import KanbanBoard from '@/components/Admin/StaffHub/KanbanBoard';
import { KanbanTask } from '@crystaltides/shared';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/components/Admin/StaffHub/CalendarView', () => ({
    default: () => <div data-testid="calendar-view">Calendar View Mock</div>,
}));

vi.mock('@/services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'fake-token' } },
            }),
        },
    },
}));

vi.mock('@/services/adminAuth', () => ({
    getAuthHeaders: vi.fn(() => ({ Authorization: 'Bearer fake-token' })),
}));

describe('KanbanBoard', () => {
    const sampleTasks: KanbanTask[] = [
        {
            id: 1,
            title: 'Actualizar Guía de Bienvenida',
            columnId: 'idea',
            column_id: 'idea',
            priority: 'Medium',
            type: 'Feature',
            created_at: '2026-03-01T00:00:00Z',
        },
        {
            id: 2,
            title: 'Reparar Caída de TPS',
            columnId: 'todo',
            column_id: 'todo',
            priority: 'High',
            type: 'Bug',
            created_at: '2026-03-01T00:00:00Z',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders kanban board columns with tasks in board view mode', () => {
        // Arrange & Act
        renderWithProviders(
            <KanbanBoard
                mockTasks={sampleTasks}
                mockGoogleEvents={[]}
                mockNotionTasks={[]}
            />
        );

        // Assert
        expect(screen.getByText('Ideas / Backlog')).toBeInTheDocument();
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
        expect(screen.getByText('En Progreso')).toBeInTheDocument();
        expect(screen.getByText('Completado')).toBeInTheDocument();
    });

    it('switches between board view and calendar view', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <KanbanBoard
                mockTasks={sampleTasks}
                mockGoogleEvents={[]}
                mockNotionTasks={[]}
            />
        );

        // Initially in board view
        expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument();

        // Act: click calendar tab
        const calendarTab = screen.getByRole('button', { name: /calendar/i });
        await user.click(calendarTab);

        // Assert: calendar view is displayed
        expect(screen.getByTestId('calendar-view')).toBeInTheDocument();

        // Act: click board tab
        const boardTab = screen.getByRole('button', { name: /board/i });
        await user.click(boardTab);

        // Assert: board view returns
        expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument();
    });

    it('opens task creation modal when clicking new task button', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <KanbanBoard
                mockTasks={sampleTasks}
                mockGoogleEvents={[]}
                mockNotionTasks={[]}
            />
        );

        // Act: click new task button
        const newTaskBtn = screen.getByRole('button', { name: /nueva tarea/i });
        await user.click(newTaskBtn);

        // Assert: task creation modal is displayed
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Nueva Tarea' })).toBeInTheDocument();

        // Act: close modal
        const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
        await user.click(cancelBtn);

        // Assert modal is closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deletes a task via confirmation modal', async () => {
        // Arrange
        const user = userEvent.setup();
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
        });

        renderWithProviders(
            <KanbanBoard
                mockTasks={sampleTasks}
                mockGoogleEvents={[]}
                mockNotionTasks={[]}
            />
        );

        // Expand first column (idea) to access delete button
        const ideaColumnHeader = screen.getByText('Ideas / Backlog');
        await user.click(ideaColumnHeader);

        // Act: click delete button
        const deleteBtn = screen.getByRole('button', { name: /eliminar tarea: actualizar guía de bienvenida/i });
        await user.click(deleteBtn);

        // Assert confirmation modal opens
        expect(screen.getByText('Eliminar Tarea')).toBeInTheDocument();

        // Act: confirm deletion
        const confirmBtn = screen.getByTestId('confirmation-modal-confirm');
        await user.click(confirmBtn);

        // Assert DELETE fetch called
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/staff/tasks/1'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });
});
