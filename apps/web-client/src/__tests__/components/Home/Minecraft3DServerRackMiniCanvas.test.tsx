import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import { Minecraft3DServerRackMiniCanvas } from '@/components/Home/Minecraft3DServerRackMiniCanvas';

vi.mock('three', () => ({
    Scene: class {
        add = vi.fn();
        remove = vi.fn();
    },
    PerspectiveCamera: class {
        position = { set: vi.fn() };
        lookAt = vi.fn();
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
    PointLight: class {
        position = { set: vi.fn() };
    },
    Group: class {
        add = vi.fn();
        scale = { set: vi.fn() };
        rotation = { y: 0, x: 0 };
    },
    BoxGeometry: class {
        attributes = { uv: { needsUpdate: false, setXY: vi.fn() } };
    },
    MeshBasicMaterial: class {},
    MeshStandardMaterial: class {
        emissiveIntensity = 0.5;
    },
    Mesh: class {
        position = { set: vi.fn() };
    },
    Color: class {},
    TextureLoader: class {
        load = vi.fn().mockImplementation((_url: string, cb?: (t: { magFilter: number; minFilter: number; colorSpace: string; wrapS: number; wrapT: number; offset: { y: number } }) => void) => {
            const tex = {
                magFilter: 0,
                minFilter: 0,
                colorSpace: '',
                wrapS: 0,
                wrapT: 0,
                offset: { y: 0 },
            };
            if (cb) cb(tex);
            return tex;
        });
    },
    Clock: class {
        getElapsedTime = vi.fn().mockReturnValue(1.0);
    },
    NearestFilter: 1003,
    SRGBColorSpace: 'srgb',
    RepeatWrapping: 1000,
}));

describe('Minecraft3DServerRackMiniCanvas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                cubes: [
                    {
                        name: 'cube1',
                        size: [1, 1, 1],
                        position: [0, 0, 0],
                        faces: [
                            {
                                three_idx: 0,
                                mc_face: 'north',
                                texture: 'case',
                                uv: [0, 0, 1, 1],
                                rotation: 0,
                            },
                        ],
                    },
                ],
            }),
        } as unknown as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders mini rack canvas container and mounts canvas', async () => {
        const { container } = renderWithProviders(<Minecraft3DServerRackMiniCanvas />);

        const wrapper = container.querySelector('.w-12.h-12');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper?.querySelector('canvas')).toBeInTheDocument();
    });

    it('cleans up without error on unmount', () => {
        const { unmount } = renderWithProviders(<Minecraft3DServerRackMiniCanvas />);
        expect(() => unmount()).not.toThrow();
        expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
});
