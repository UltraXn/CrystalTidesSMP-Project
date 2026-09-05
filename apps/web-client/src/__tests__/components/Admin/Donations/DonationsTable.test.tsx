import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import DonationsTable from '@/components/Admin/Donations/DonationsTable';
import { Donation } from '@/components/Admin/Donations/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('DonationsTable', () => {
    const sampleDonations: Donation[] = [
        {
            id: 1,
            amount: 75.0,
            currency: 'USD',
            from_name: 'VipDonor',
            message: 'Keep up the good work',
            is_public: true,
            buyer_email: 'vip@donor.org',
            created_at: '2026-03-01T10:00:00Z',
        },
        {
            id: 2,
            amount: 15.0,
            currency: 'EUR',
            from_name: '',
            message: '',
            is_public: false,
            buyer_email: undefined,
            created_at: '2026-03-02T10:00:00Z',
        },
    ];

    it('renders loader when loading and donations array is empty', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationsTable
                donations={[]}
                loading={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                page={1}
                totalPages={1}
                setPage={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByAltText('Crystal Tides')).toBeInTheDocument();
    });

    it('renders empty state when not loading and donations array is empty', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationsTable
                donations={[]}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                page={1}
                totalPages={1}
                setPage={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('admin.donations.empty')).toBeInTheDocument();
        expect(screen.getByText(/no hay registros de donaciones/i)).toBeInTheDocument();
    });

    it('renders donations list with rows, amounts, and badges', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationsTable
                donations={sampleDonations}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                page={1}
                totalPages={1}
                setPage={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('VipDonor')).toBeInTheDocument();
        expect(screen.getByText('vip@donor.org')).toBeInTheDocument();
        expect(screen.getByText('USD 75.00')).toBeInTheDocument();
        expect(screen.getByText('Keep up the good work')).toBeInTheDocument();
        expect(screen.getByText('admin.donations.public')).toBeInTheDocument();

        // Second donation (anonymous & private)
        expect(screen.getByText('admin.donations.anonymous')).toBeInTheDocument();
        expect(screen.getByText('admin.donations.no_msg')).toBeInTheDocument();
        expect(screen.getByText('EUR 15.00')).toBeInTheDocument();
        expect(screen.getByText('admin.donations.private')).toBeInTheDocument();
    });

    it('triggers onEdit when edit action button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onEdit = vi.fn();

        renderWithProviders(
            <DonationsTable
                donations={sampleDonations}
                loading={false}
                onEdit={onEdit}
                onDelete={vi.fn()}
                page={1}
                totalPages={1}
                setPage={vi.fn()}
            />
        );

        // Act
        const editBtn = screen.getByRole('button', { name: /editar donación de vipdonor/i });
        await user.click(editBtn);

        // Assert
        expect(onEdit).toHaveBeenCalledWith(sampleDonations[0]);
    });

    it('triggers onDelete when delete action button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onDelete = vi.fn();

        renderWithProviders(
            <DonationsTable
                donations={sampleDonations}
                loading={false}
                onEdit={vi.fn()}
                onDelete={onDelete}
                page={1}
                totalPages={1}
                setPage={vi.fn()}
            />
        );

        // Act
        const deleteBtn = screen.getByRole('button', { name: /eliminar donación de vipdonor/i });
        await user.click(deleteBtn);

        // Assert
        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('renders pagination and handles page navigation when totalPages > 1', async () => {
        // Arrange
        const user = userEvent.setup();
        const setPage = vi.fn();

        renderWithProviders(
            <DonationsTable
                donations={sampleDonations}
                loading={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                page={1}
                totalPages={3}
                setPage={setPage}
            />
        );

        // Assert page info and prev disabled on page 1
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        const prevBtn = screen.getByRole('button', { name: /página anterior/i });
        const nextBtn = screen.getByRole('button', { name: /página siguiente/i });

        expect(prevBtn).toBeDisabled();
        expect(nextBtn).toBeEnabled();

        // Act
        await user.click(nextBtn);

        // Assert
        expect(setPage).toHaveBeenCalledTimes(1);
        const updateFn = setPage.mock.calls[0][0] as (p: number) => number;
        expect(updateFn(1)).toBe(2);
    });
});
