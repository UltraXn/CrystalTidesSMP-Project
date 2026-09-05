import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import DonorsList from '@/components/Admin/Donors/DonorsList';
import { Donor } from '@/components/Admin/Donors/DonorFormModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
        children({
            droppableProps: {},
            innerRef: vi.fn(),
            placeholder: <div data-testid="droppable-placeholder" />,
        }),
    Draggable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
        children({
            draggableProps: {},
            dragHandleProps: {},
            innerRef: vi.fn(),
        }),
}));

describe('DonorsList', () => {
    const sampleDonors: Donor[] = [
        {
            id: 'donor-1',
            name: 'DiamondKing',
            skinUrl: 'https://example.com/diamond.png',
            description: 'Top supporter since season 1',
            ranks: ['donador', 'fundador'],
            isPremium: true,
        },
        {
            id: 'donor-2',
            name: 'GoldMiner',
            skinUrl: '',
            description: 'Builder and contributor',
            ranks: ['helper'],
            isPremium: false,
        },
    ];

    it('renders empty state and calls onImport when import button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onImport = vi.fn();

        renderWithProviders(
            <DonorsList
                donors={[]}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onImport={onImport}
            />
        );

        // Assert
        expect(screen.getByText('admin.donors.empty_msg')).toBeInTheDocument();
        const importBtn = screen.getByRole('button', { name: 'admin.donors.import_btn' });
        expect(importBtn).toBeInTheDocument();

        // Act
        await user.click(importBtn);

        // Assert
        expect(onImport).toHaveBeenCalledTimes(1);
    });

    it('renders list of donor cards with names, ranks, and descriptions', () => {
        // Arrange & Act
        renderWithProviders(
            <DonorsList
                donors={sampleDonors}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onImport={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('DiamondKing')).toBeInTheDocument();
        expect(screen.getByText('"Top supporter since season 1"')).toBeInTheDocument();
        expect(screen.getByText('donador')).toBeInTheDocument();
        expect(screen.getByText('fundador')).toBeInTheDocument();

        expect(screen.getByText('GoldMiner')).toBeInTheDocument();
        expect(screen.getByText('"Builder and contributor"')).toBeInTheDocument();
        expect(screen.getByText('helper')).toBeInTheDocument();
    });

    it('triggers onEdit with the selected donor when edit button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onEdit = vi.fn();

        renderWithProviders(
            <DonorsList
                donors={sampleDonors}
                onDragEnd={vi.fn()}
                onEdit={onEdit}
                onDelete={vi.fn()}
                onImport={vi.fn()}
            />
        );

        // Act: click first edit button
        const editButtons = screen.getAllByRole('button', { name: /editar/i });
        await user.click(editButtons[0]);

        // Assert
        expect(onEdit).toHaveBeenCalledWith(sampleDonors[0]);
    });

    it('triggers onDelete with the donor id when delete button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onDelete = vi.fn();

        renderWithProviders(
            <DonorsList
                donors={sampleDonors}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={onDelete}
                onImport={vi.fn()}
            />
        );

        // Act: click second delete button
        const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
        await user.click(deleteButtons[1]);

        // Assert
        expect(onDelete).toHaveBeenCalledWith('donor-2');
    });

    it('handles image error fallback for donor avatar', () => {
        // Arrange & Act
        renderWithProviders(
            <DonorsList
                donors={sampleDonors}
                onDragEnd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onImport={vi.fn()}
            />
        );

        const img = screen.getByAltText('DiamondKing') as HTMLImageElement;
        expect(img.src).toBe('https://example.com/diamond.png');

        // Act: trigger error event
        fireEvent.error(img);

        // Assert fallback
        expect(img.src).toContain('https://mc-heads.net/avatar/Steve/64');
    });
});
