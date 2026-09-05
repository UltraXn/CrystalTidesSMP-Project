import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import LazyWrapper from '@/components/Utils/LazyWrapper';
import { renderWithProviders } from '@/utils/test-utils';
import * as observerHook from '@/hooks/useIntersectionObserver';

vi.mock('@/components/UI/Loader', () => ({
    default: () => <div data-testid="default-loader">Loading...</div>,
}));

describe('LazyWrapper', () => {
    it('does not render children when element is not visible', () => {
        vi.spyOn(observerHook, 'useIntersectionObserver').mockReturnValue([
            { current: null },
            false,
        ]);

        renderWithProviders(
            <LazyWrapper>
                <div data-testid="lazy-content">Contenido Oculto</div>
            </LazyWrapper>
        );

        expect(screen.queryByTestId('lazy-content')).not.toBeInTheDocument();
    });

    it('renders children when intersection observer becomes visible', () => {
        vi.spyOn(observerHook, 'useIntersectionObserver').mockReturnValue([
            { current: null },
            true,
        ]);

        renderWithProviders(
            <LazyWrapper>
                <div data-testid="lazy-content">Contenido Visible</div>
            </LazyWrapper>
        );

        expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
    });

    it('executes render prop when provided and visible', () => {
        vi.spyOn(observerHook, 'useIntersectionObserver').mockReturnValue([
            { current: null },
            true,
        ]);

        const renderProp = vi.fn(() => <div data-testid="render-prop-content">Render Function</div>);

        renderWithProviders(<LazyWrapper render={renderProp} />);

        expect(renderProp).toHaveBeenCalledOnce();
        expect(screen.getByTestId('render-prop-content')).toBeInTheDocument();
    });
});
