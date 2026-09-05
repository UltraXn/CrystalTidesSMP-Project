import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import CalendarView, { GoogleEvent } from '@/components/Admin/StaffHub/CalendarView';
import { KanbanTask } from '@crystaltides/shared';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
        i18n: { language: 'es' },
    }),
}));

vi.mock('react-big-calendar', () => ({
    Calendar: ({
        events,
    }: {
        events: { id: string | number; title: string; resource?: unknown; type?: string }[];
    }) => (
        <div data-testid="calendar-container">
            <span data-testid="calendar-events-count">{events.length}</span>
            {events.map((e) => (
                <div
                    key={e.id}
                    data-testid={`event-item-${e.id}`}
                >
                    {e.title}
                </div>
            ))}
        </div>
    ),
    dateFnsLocalizer: vi.fn(() => ({})),
}));

vi.mock('react-big-calendar/lib/addons/dragAndDrop', () => ({
    default: (Component: React.ComponentType<unknown>) => Component,
}));

describe('CalendarView', () => {
    const sampleTasks: KanbanTask[] = [
        {
            id: 1,
            title: 'Fix Spawn Glitch',
            columnId: 'todo',
            due_date: '2026-03-10T10:00:00Z',
            priority: 'High',
            type: 'Bug',
            created_at: '2026-03-01T00:00:00Z',
        },
        {
            id: 2,
            title: 'No Date Task',
            columnId: 'idea',
            created_at: '2026-03-01T00:00:00Z',
        },
    ];

    const sampleGoogleEvents: GoogleEvent[] = [
        {
            id: 'g-event-1',
            summary: 'Staff Weekly Sync',
            start: { dateTime: '2026-03-10T15:00:00Z' },
            end: { dateTime: '2026-03-10T16:00:00Z' },
        },
    ];

    it('maps valid tasks and external Google events to calendar events', () => {
        // Arrange & Act
        renderWithProviders(
            <CalendarView
                tasks={sampleTasks}
                googleEvents={sampleGoogleEvents}
                onEditTask={vi.fn()}
            />
        );

        // Assert: Task 1 and Google event 1 are present, task without date is excluded
        expect(screen.getByTestId('calendar-events-count')).toHaveTextContent('2');
        expect(screen.getByText('Fix Spawn Glitch')).toBeInTheDocument();
        expect(screen.getByText('Staff Weekly Sync')).toBeInTheDocument();
    });

    it('excludes idea column tasks from calendar events', () => {
        // Arrange & Act
        renderWithProviders(
            <CalendarView
                tasks={sampleTasks}
                googleEvents={[]}
                onEditTask={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByTestId('calendar-events-count')).toHaveTextContent('1');
        expect(screen.getByText('Fix Spawn Glitch')).toBeInTheDocument();
        expect(screen.queryByText('No Date Task')).not.toBeInTheDocument();
    });

    it('renders empty calendar when no tasks or google events are provided', () => {
        // Arrange & Act
        renderWithProviders(
            <CalendarView
                tasks={[]}
                googleEvents={[]}
                onEditTask={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByTestId('calendar-events-count')).toHaveTextContent('0');
    });
});
