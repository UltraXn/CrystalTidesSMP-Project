import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import ServerStatusCard, { ServerStatusData } from '@/components/Server/ServerStatusCard';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    return {
        m: {
            div: Component,
        },
        motion: {
            div: Component,
        },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

const mockOnlineStatus: ServerStatusData = {
    online: true,
    motd: 'Bienvenido a CrystalTides SMP',
    version: '1.21.1',
    players: {
        online: 42,
        max: 100,
        sample: [{ name: 'Steve', id: '1' }],
    },
    icon: '/images/server_icon.png',
};

const mockOfflineStatus: ServerStatusData = {
    online: false,
    motd: 'Servidor en mantenimiento',
    version: '1.21.1',
    players: {
        online: 0,
        max: 0,
        sample: [],
    },
    icon: '',
};

const writeTextMock = vi.fn().mockResolvedValue(undefined);

describe('ServerStatusCard', () => {
    beforeEach(() => {
        writeTextMock.mockClear();
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: writeTextMock,
            },
            writable: true,
            configurable: true,
        });
    });

    it('renders online server statistics with players, version, and motd', () => {
        renderWithProviders(<ServerStatusCard status={mockOnlineStatus} serverIp="play.crystaltides.net" />);

        expect(screen.getByText('play.crystaltides.net')).toBeInTheDocument();
        expect(screen.getByText('Bienvenido a CrystalTides SMP')).toBeInTheDocument();
        expect(screen.getByText(/42/)).toBeInTheDocument();
        expect(screen.getByText(/100/)).toBeInTheDocument();
        expect(screen.getByText(/1.21.1/)).toBeInTheDocument();

        const progressBar = screen.getByRole('progressbar', { name: /status\.players|jugadores|players/i });
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '42');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders offline indicator when server is offline or null', () => {
        renderWithProviders(<ServerStatusCard status={mockOfflineStatus} />);

        expect(screen.getByText('Servidor en mantenimiento')).toBeInTheDocument();
        expect(screen.getByText(/status\.offline|offline|desconectado/i)).toBeInTheDocument();
    });

    it('copies the server IP to clipboard on click', () => {
        renderWithProviders(<ServerStatusCard status={mockOnlineStatus} serverIp="mc.crystaltides.net" />);

        const copyBtn = screen.getByRole('button', { name: /common\.copy|copiar|copy/i });
        fireEvent.click(copyBtn);

        expect(writeTextMock).toHaveBeenCalledWith('mc.crystaltides.net');
    });
});
