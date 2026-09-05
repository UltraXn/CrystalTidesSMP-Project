import { describe, it, expect, vi, beforeEach } from 'vitest';
import SkinViewerComponent from '@/components/Widgets/SkinViewer';
import { renderWithProviders } from '@/utils/test-utils';

const mockDispose = vi.fn();

vi.mock('skinview3d', () => {
    return {
        SkinViewer: class MockSkinViewer {
            dispose = mockDispose;
            animation = { paused: false };
            controls = { enableZoom: false, target: { y: 0 } };
            camera = { position: { z: 0 } };
            constructor() {}
        },
        IdleAnimation: class MockIdleAnimation {},
        WalkingAnimation: class MockWalkingAnimation {},
    };
});

describe('SkinViewerComponent', () => {
    beforeEach(() => {
        mockDispose.mockClear();
        class TestIntersectionObserver {
            callback: IntersectionObserverCallback;
            constructor(callback: IntersectionObserverCallback) {
                this.callback = callback;
            }
            observe() {
                this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
            }
            unobserve = vi.fn();
            disconnect = vi.fn();
        }
        window.IntersectionObserver = TestIntersectionObserver as unknown as typeof IntersectionObserver;
    });

    it('renders skin viewer container with canvas element', () => {
        const { container } = renderWithProviders(
            <SkinViewerComponent skinUrl="https://example.com/skin.png" width={250} height={350} />
        );

        const viewerContainer = container.querySelector('.skin-viewer-container');
        expect(viewerContainer).toBeInTheDocument();
        expect(viewerContainer).toHaveStyle({ width: '250px', height: '350px' });

        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('calls dispose on unmount to prevent memory leaks', () => {
        const { unmount } = renderWithProviders(
            <SkinViewerComponent skinUrl="https://example.com/skin.png" />
        );

        unmount();
        expect(mockDispose).toHaveBeenCalled();
    });
});
