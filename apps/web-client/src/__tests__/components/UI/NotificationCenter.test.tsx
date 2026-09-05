import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationCenter from '@/components/UI/NotificationCenter';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, _layout, ...p }: { children?: React.ReactNode; _layout?: unknown } & Record<string, unknown>) => <div {...p}>{children}</div>,
        button: ({ children, _layout, ...p }: { children?: React.ReactNode; _layout?: unknown } & Record<string, unknown>) => <button {...p}>{children}</button>
    },
    m: {
        div: ({ children, _layout, ...p }: { children?: React.ReactNode; _layout?: unknown } & Record<string, unknown>) => <div {...p}>{children}</div>,
        button: ({ children, _layout, ...p }: { children?: React.ReactNode; _layout?: unknown } & Record<string, unknown>) => <button {...p}>{children}</button>
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('NotificationCenter', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the notification center button and toggle its state', async () => {
        render(<NotificationCenter />);
        const button = screen.getByRole('button', { name: /admin.notifications.label/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveClass('active');

        await user.click(button);
        expect(button).toHaveClass('active');

        await user.click(button);
        expect(button).not.toHaveClass('active');
    });

    it('should display unread count if there are unread notifications', () => {
        render(<NotificationCenter />);
        const unreadCount = screen.getByText('2');
        expect(unreadCount).toBeInTheDocument();
    });

    it('should not display unread count if all notifications are read', () => {
        const mockNotifications = [
            { id: 1, type: 'success', title: 'Rango Activado', message: 'Tu membresía Donador ha sido sincronizada.', time: 'Hace 5 min', read: true },
            { id: 2, type: 'warning', title: 'Mantenimiento', message: 'Reinicio programado a las 04:00 UTC.', time: 'Hace 1 hora', read: true },
            { id: 3, type: 'info', title: 'Nuevo Parche', message: 'Se han añadido 12 nuevos items a la Wiki.', time: 'Hace 3 horas', read: true }
        ];
        render(<NotificationCenter mockNotifications={mockNotifications} />);
        const unreadCount = screen.queryByText('2');
        expect(unreadCount).not.toBeInTheDocument();
    });

    it('should mark all notifications as read', async () => {
        render(<NotificationCenter initialOpen />);
        const markAllReadButton = screen.getByRole('button', { name: /admin.notifications.mark_all_read/i });
        expect(markAllReadButton).toBeInTheDocument();

        await user.click(markAllReadButton);

        const unreadCount = screen.queryByText('2');
        expect(unreadCount).not.toBeInTheDocument();
    });

    it('should delete a notification', async () => {
        render(<NotificationCenter initialOpen />);
        const deleteButton = screen.getAllByRole('button', { name: /admin.notifications.dismiss/i })[0];
        expect(deleteButton).toBeInTheDocument();

        await user.click(deleteButton);

        const notification = screen.queryByText('Rango Activado');
        expect(notification).not.toBeInTheDocument();
    });

    it('should not delete a notification when clicking outside', async () => {
        render(<NotificationCenter />);
        const container = screen.getByRole('button', { name: /admin.notifications.label/i });
        await user.click(container);

        await user.click(document.body);

        await user.click(container);
        const notification = screen.getByText('Rango Activado');
        expect(notification).toBeInTheDocument();
    });

    it('should render no notifications message when there are no notifications', () => {
        render(<NotificationCenter initialOpen mockNotifications={[]} />);
        const noNotificationsMessage = screen.getByText(/admin.notifications.empty/i);
        expect(noNotificationsMessage).toBeInTheDocument();
    });

    it('should render notifications with correct icons', () => {
        render(<NotificationCenter initialOpen />);
        const successIcon = screen.getByRole('img', { name: /CheckCircle2/i });
        const warningIcon = screen.getByRole('img', { name: /AlertTriangle/i });
        const infoIcon = screen.getByRole('img', { name: /Info/i });

        expect(successIcon).toBeInTheDocument();
        expect(warningIcon).toBeInTheDocument();
        expect(infoIcon).toBeInTheDocument();
    });

    it('should render notifications with correct styles for read and unread', () => {
        render(<NotificationCenter initialOpen />);
        const unreadNotification = screen.getByText('Rango Activado');
        const readNotification = screen.getByText('Nuevo Parche');

        expect(unreadNotification.closest('.notification-item')).toHaveStyle('background: rgba(var(--accent-rgb), 0.05)');
        expect(readNotification.closest('.notification-item')).toHaveStyle('background: transparent');
    });
});
