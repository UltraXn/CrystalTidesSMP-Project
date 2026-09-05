import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import { Minecraft3DSkullCanvas } from '@/components/Home/Minecraft3DSkullCanvas';

vi.mock('three', () => ({
    Scene: class {
        add = vi.fn();
        remove = vi.fn();
    },
    PerspectiveCamera: class {
        position = { set: vi.fn() };
    },
    WebGLRenderer: class {
        get domElement() {
            return document.createElement('canvas');
        }
        setSize = vi.fn();
        setPixelRatio = vi.fn();
        render = vi.fn();
        dispose = vi.fn();
    },
    AmbientLight: class {},
    DirectionalLight: class {
        position = { set: vi.fn() };
    },
    PointLight: class {
        position = { set: vi.fn() };
    },
    Group: class {
        add = vi.fn();
        rotation = { y: 0 };
        position = { y: 0 };
    },
    Clock: class {
        getDelta = vi.fn().mockReturnValue(0.016);
        getElapsedTime = vi.fn().mockReturnValue(1.0);
    },
    AnimationMixer: class {
        update = vi.fn();
        clipAction = vi.fn().mockReturnValue({
            play: vi.fn(),
        });
    },
    Box3: class {
        setFromObject = vi.fn().mockReturnThis();
        getSize = vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 });
        getCenter = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
    },
    Vector3: class {
        x = 0;
        y = 0;
        z = 0;
    },
    NearestFilter: 1003,
    DoubleSide: 2,
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
    GLTFLoader: class {
        load = vi.fn().mockImplementation((_url: string, onLoad: (gltf: { scene: { traverse: (cb: (c: unknown) => void) => void; scale: { set: () => void }; position: { set: () => void } }; animations: { name: string }[] }) => void) => {
            onLoad({
                scene: {
                    traverse: vi.fn(),
                    scale: { set: vi.fn() },
                    position: { set: vi.fn() },
                },
                animations: [{ name: 'idle' }],
            });
        });
    },
}));

describe('Minecraft3DSkullCanvas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders container div and mounts WebGL canvas', () => {
        const { container } = renderWithProviders(<Minecraft3DSkullCanvas size={48} className="custom-skull" />);

        const wrapper = container.querySelector('.custom-skull');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper?.querySelector('canvas')).toBeInTheDocument();
    });

    it('cleans up canvas on unmount', () => {
        const { unmount } = renderWithProviders(<Minecraft3DSkullCanvas size={40} />);
        expect(() => unmount()).not.toThrow();
        expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
});
