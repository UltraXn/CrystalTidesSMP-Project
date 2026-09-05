import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import EventsList from '@/components/Admin/Events/EventsList';
import { Event } from '@/components/Admin/Events/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('EventsList', () => {
    const sampleEvents: Event[] = [
        {
            id: 1,
            title: 'Gran Torneo PvP',
            description: 'Torneo 1v1 en la arena principal',
            type: 'hammer',
            status: 'active',
            registrations: [
                { id: 101, created_at: '2026-03-01T00:00:00Z' },
                { id: 102, created_at: '2026-03-01T01:00:00Z' },
            ],
        },
        {
            id: 2,
            title: 'Carrera de Caballos',
            description: 'Carrera de obstáculos por el bioma llanura',
            type: 'running',
            status: 'soon',
            registrations: [],
        },
    ];

    it('renders loader when loading is true', () => {
        // Arrange & Act
        renderWithProviders(
            <EventsList
                events={[]}
                loading={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onViewRegistrations={vi.fn()}
                onNew={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByAltText('Crystal Tides')).toBeInTheDocument();
    });

    it('renders empty state when events list is empty and calls onNew on button click', async () => {
        // Arrange
        const user = userEvent.setup();
        const onNew = vi.fn();

        renderWithProviders(
            <EventsList
                events={[]}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onViewRegistrations={vi.fn()}
                onNew={onNew}
            />
        );

        // Assert
        expect(screen.getByText('admin.events.no_events')).toBeInTheDocument();
        const createBtn = screen.getByRole('button', { name: /admin\.events\.create_title/i });
        expect(createBtn).toBeInTheDocument();

        // Act
        await user.click(createBtn);

        // Assert
        expect(onNew).toHaveBeenCalledTimes(1);
    });

    it('renders list of event cards with titles, descriptions, and registration count', () => {
        // Arrange & Act
        renderWithProviders(
            <EventsList
                events={sampleEvents}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onViewRegistrations={vi.fn()}
                onNew={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('Gran Torneo PvP')).toBeInTheDocument();
        expect(screen.getByText('Torneo 1v1 en la arena principal')).toBeInTheDocument();
        expect(screen.getByText('2 Registrados')).toBeInTheDocument();

        expect(screen.getByText('Carrera de Caballos')).toBeInTheDocument();
        expect(screen.getByText('Carrera de obstáculos por el bioma llanura')).toBeInTheDocument();
        expect(screen.getByText('0 Registrados')).toBeInTheDocument();
    });

    it('calls onViewRegistrations when view registrations button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onViewRegistrations = vi.fn();

        renderWithProviders(
            <EventsList
                events={sampleEvents}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onViewRegistrations={onViewRegistrations}
                onNew={vi.fn()}
            />
        );

        // Act
        const viewRegButtons = screen.getAllByTitle('admin.events.registrations.view_tooltip');
        await user.click(viewRegButtons[0]);

        // Assert
        expect(onViewRegistrations).toHaveBeenCalledWith(1);
    });

    it('calls onEdit when edit button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onEdit = vi.fn();

        renderWithProviders(
            <EventsList
                events={sampleEvents}
                loading={false}
                onEdit={onEdit}
                onDelete={vi.fn()}
                onViewRegistrations={vi.fn()}
                onNew={vi.fn()}
            />
        );

        // Act
        const editButtons = screen.getAllByTitle('admin.events.edit_title');
        await user.click(editButtons[0]);

        // Assert
        expect(onEdit).toHaveBeenCalledWith(sampleEvents[0]);
    });

    it('calls onDelete when delete button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onDelete = vi.fn();

        renderWithProviders(
            <EventsList
                events={sampleEvents}
                loading={false}
                onEdit={vi.fn()}
                onDelete={onDelete}
                onViewRegistrations={vi.fn()}
                onNew={vi.fn()}
            />
        );

        // Act
        const deleteButtons = screen.getAllByTitle('admin.events.delete_tooltip');
        await user.click(deleteButtons[1]);

        // Assert
        expect(onDelete).toHaveBeenCalledWith(2);
    });
});
