import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import TicketDetailModal from '@/components/Admin/Tickets/TicketDetailModal';
import { Ticket, Message } from '@/components/Admin/Tickets/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
};

vi.mock('../../../services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'mock-token' } },
            }),
        },
        channel: vi.fn().mockReturnValue(mockChannel),
        removeChannel: vi.fn(),
    },
}));

vi.mock('../../../services/adminAuth', () => ({
    getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer mock-token' }),
}));

describe('TicketDetailModal', () => {
    const mockTicket: Ticket = {
        id: 42,
        user_id: 'user-abc',
        subject: 'Cannot access nether portal',
        description: 'Every time I enter the portal the game disconnects me.',
        priority: 'high',
        status: 'open',
        created_at: '2026-03-01T12:00:00Z',
    };

    const mockMessages: Message[] = [
        {
            id: 101,
            user_id: 'user-abc',
            message: 'Hello, any updates on this issue?',
            is_staff: false,
            created_at: '2026-03-01T12:05:00Z',
        },
        {
            id: 102,
            user_id: 'staff-admin',
            message: 'Looking into it right now!',
            is_staff: true,
            created_at: '2026-03-01T12:10:00Z',
        },
    ];

    const defaultProps = {
        ticket: mockTicket,
        onClose: vi.fn(),
        refreshTickets: vi.fn(),
        mockMessages: mockMessages,
        user: { id: 'staff-admin' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: [] }),
        } as Response);
    });

    it('renders ticket details and messages correctly', () => {
        renderWithProviders(<TicketDetailModal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Cannot access nether portal')).toBeInTheDocument();
        expect(screen.getByText('#42')).toBeInTheDocument();
        expect(screen.getByText('Every time I enter the portal the game disconnects me.')).toBeInTheDocument();

        expect(screen.getByText('Hello, any updates on this issue?')).toBeInTheDocument();
        expect(screen.getByText('Looking into it right now!')).toBeInTheDocument();
    });

    it('allows sending a reply message', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TicketDetailModal {...defaultProps} />);

        const replyInput = screen.getByLabelText('Escribe una respuesta...');
        const sendBtn = screen.getByRole('button', { name: 'Enviar respuesta' });

        await user.type(replyInput, 'We found the issue and fixed the portal chunk.');
        await user.click(sendBtn);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/42/messages'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    user_id: 'staff-admin',
                    message: 'We found the issue and fixed the portal chunk.',
                    is_staff: true,
                }),
            })
        );
    });

    it('resolves ticket and calls refreshTickets and onClose', async () => {
        const user = userEvent.setup();
        const refreshTickets = vi.fn();
        const onClose = vi.fn();

        renderWithProviders(
            <TicketDetailModal {...defaultProps} refreshTickets={refreshTickets} onClose={onClose} />
        );

        const resolveBtn = screen.getByRole('button', { name: 'Resolver' });
        await user.click(resolveBtn);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/42/status'),
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ status: 'resolved' }),
            })
        );
        expect(refreshTickets).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes ticket when clicking close action button', async () => {
        const user = userEvent.setup();
        const refreshTickets = vi.fn();
        const onClose = vi.fn();

        renderWithProviders(
            <TicketDetailModal {...defaultProps} refreshTickets={refreshTickets} onClose={onClose} />
        );

        const closeTicketBtn = screen.getByRole('button', { name: 'Cerrar' });
        await user.click(closeTicketBtn);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/42/status'),
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ status: 'closed' }),
            })
        );
    });

    it('handles delete flow with confirmation modal', async () => {
        const user = userEvent.setup();
        const refreshTickets = vi.fn();
        const onClose = vi.fn();

        renderWithProviders(
            <TicketDetailModal {...defaultProps} refreshTickets={refreshTickets} onClose={onClose} />
        );

        const deleteActionBtn = screen.getByRole('button', { name: 'Eliminar' });
        await user.click(deleteActionBtn);

        expect(screen.getByText('¿Estás seguro de eliminar este ticket?')).toBeInTheDocument();

        // Confirm button inside CustomConfirm
        const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
        await user.click(deleteButtons[1]);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/42'),
            expect.objectContaining({
                method: 'DELETE',
            })
        );
        expect(refreshTickets).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows lock notice and reopen button when ticket status is closed', () => {
        const closedTicket: Ticket = { ...mockTicket, status: 'closed' };
        renderWithProviders(<TicketDetailModal {...defaultProps} ticket={closedTicket} />);

        expect(screen.getByText(/Este ticket ha sido cerrado y no se pueden enviar más mensajes/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reabrir' })).toBeInTheDocument();
    });

    it('opens ban modal when clicking ban button', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TicketDetailModal {...defaultProps} />);

        const banBtn = screen.getByRole('button', { name: 'Banear' });
        await user.click(banBtn);

        expect(screen.getByRole('heading', { level: 3, name: 'Banear Usuario Importuno' })).toBeInTheDocument();
    });

    it('calls onClose when clicking close modal button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithProviders(<TicketDetailModal {...defaultProps} onClose={onClose} />);

        const closeBtn = screen.getByRole('button', { name: 'Cerrar ticket' });
        await user.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
