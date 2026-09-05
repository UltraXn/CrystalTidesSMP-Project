import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KoFiButton, KoFiWidget } from '@/components/Widgets/KoFi';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('gsap', () => ({
    gsap: {
        to: vi.fn().mockReturnValue({ kill: vi.fn() }),
    },
}));

describe('KoFiButton', () => {
    it('renders a secure external donation link with custom text and id', () => {
        renderWithProviders(<KoFiButton kofiId="MyCreatorId" text="Donar ahora" />);

        const link = screen.getByRole('link', { name: /donar ahora/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://ko-fi.com/MyCreatorId');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('triggers hover animations when mouse moves over and leaves', async () => {
        const user = userEvent.setup();
        renderWithProviders(<KoFiButton />);

        const link = screen.getByRole('link', { name: /¡dona por ko-fi!/i });
        await user.hover(link);
        await user.unhover(link);

        expect(link).toBeInTheDocument();
    });
});

describe('KoFiWidget', () => {
    afterEach(() => {
        const script = document.getElementById('kofi-widget-script');
        if (script) script.remove();
    });

    it('injects the ko-fi cdn script tag into document body', () => {
        renderWithProviders(<KoFiWidget kofiId="WidgetId123" />);

        const script = document.getElementById('kofi-widget-script') as HTMLScriptElement | null;
        expect(script).not.toBeNull();
        expect(script?.src).toContain('Widget_2.js');
    });
});
