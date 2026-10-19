import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import Lazy3DContainer from '@/components/UI/Lazy3DContainer';

describe('Lazy3DContainer', () => {
  const originalIntersectionObserver = window.IntersectionObserver;

  type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
  let observerCallback: ObserverCallback;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let mockObserve: ReturnType<typeof vi.fn>;
  let lastObserverOptions: IntersectionObserverInit | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDisconnect = vi.fn();
    mockObserve = vi.fn();

    const MockObserver = vi.fn(function (
      this: unknown,
      callback: ObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      observerCallback = callback;
      lastObserverOptions = options;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
        takeRecords: vi.fn().mockReturnValue([]),
        root: null,
        rootMargin: options?.rootMargin || '',
        thresholds: [],
      };
    });

    window.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      originalIntersectionObserver;
  });

  it('renders children directly when IntersectionObserver is undefined (SSR/test fallback)', () => {
    // @ts-expect-error test undefined fallback
    window.IntersectionObserver = undefined;
    // @ts-expect-error test undefined fallback
    globalThis.IntersectionObserver = undefined;

    renderWithProviders(
      <Lazy3DContainer>
        <div data-testid="direct-child">3D Canvas Content</div>
      </Lazy3DContainer>,
    );

    expect(screen.getByTestId('direct-child')).toBeInTheDocument();
  });

  it('configures IntersectionObserver with rootMargin 200px 0px', () => {
    renderWithProviders(
      <Lazy3DContainer>
        <div data-testid="child">Scene</div>
      </Lazy3DContainer>,
    );

    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(lastObserverOptions?.rootMargin).toBe('200px 0px');
    expect(mockObserve).toHaveBeenCalled();
  });

  it('shows accessible placeholder initially when not intersecting', () => {
    renderWithProviders(
      <Lazy3DContainer placeholderLabel="Cargando modelo de jefe...">
        <div data-testid="child">Scene</div>
      </Lazy3DContainer>,
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cargando modelo de jefe...')).toBeInTheDocument();
  });

  it('mounts children when intersecting and unmounts when leaving viewport', () => {
    renderWithProviders(
      <Lazy3DContainer>
        <div data-testid="3d-scene">Three.js Scene</div>
      </Lazy3DContainer>,
    );

    expect(screen.queryByTestId('3d-scene')).not.toBeInTheDocument();

    // Trigger entering viewport
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('3d-scene')).toBeInTheDocument();

    // Trigger leaving viewport to free WebGL context
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(screen.queryByTestId('3d-scene')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Cargando visualizador 3D/i)).toBeInTheDocument();
  });

  it('renders custom fallback node when provided and not visible', () => {
    renderWithProviders(
      <Lazy3DContainer fallback={<div data-testid="custom-placeholder">Custom Skeleton</div>}>
        <div data-testid="child">Scene</div>
      </Lazy3DContainer>,
    );

    expect(screen.getByTestId('custom-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('disconnects IntersectionObserver on unmount', () => {
    const { unmount } = renderWithProviders(
      <Lazy3DContainer>
        <div data-testid="child">Scene</div>
      </Lazy3DContainer>,
    );

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
