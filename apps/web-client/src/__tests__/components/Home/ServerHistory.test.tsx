import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import ServerHistory from '@/components/Home/ServerHistory';

vi.mock('@/components/Home/Minecraft3DAltarCanvas', () => ({
    Minecraft3DAltarCanvas: () => <div data-testid="mock-altar-canvas" />,
}));

vi.mock('@/components/Home/Minecraft3DSkullCanvas', () => ({
    Minecraft3DSkullCanvas: () => <div data-testid="mock-skull-canvas" />,
}));

vi.mock('@/components/Home/Minecraft3DServerRackCanvas', () => ({
    Minecraft3DServerRackCanvas: () => <div data-testid="mock-server-rack-canvas" />,
}));

vi.mock('@/components/Home/Minecraft3DServerRackMiniCanvas', () => ({
    Minecraft3DServerRackMiniCanvas: () => <div data-testid="mock-server-rack-mini-canvas" />,
}));

describe('ServerHistory', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders server history timeline with initial stage 1 selected', () => {
        renderWithProviders(<ServerHistory />);

        expect(screen.getAllByText(/Historia de CrystalTides SMP/i)[0]).toBeInTheDocument();
        expect(screen.getByText('ESTACIÓN 01')).toBeInTheDocument();
    });

    it('switches to Stage 02 when clicked and renders stage 2 altar mock after transition', () => {
        renderWithProviders(<ServerHistory />);

        const stage2Btn = screen.getByText('ESTACIÓN 02');
        fireEvent.click(stage2Btn);

        // Advance past 600ms skeleton load timer
        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(screen.getByTestId('mock-altar-canvas')).toBeInTheDocument();
    });

    it('switches between stages and updates active stage details after loading completes', () => {
        renderWithProviders(<ServerHistory />);

        const stage3Btn = screen.getByText('ESTACIÓN 03');
        fireEvent.click(stage3Btn);

        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(screen.getAllByText(/Evolución a CrystalTides SMP/i)[0]).toBeInTheDocument();

        const stage4Btn = screen.getByText('ESTACIÓN 04');
        fireEvent.click(stage4Btn);

        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(screen.getAllByText(/Era Dedicada & Launcher/i)[0]).toBeInTheDocument();
    });
});
