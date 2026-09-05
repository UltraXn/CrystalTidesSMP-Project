import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import Gacha3DShowcase from '@/components/Gacha/Gacha3DShowcase';

vi.mock('three', () => {
    class MockTexture {
        colorSpace = '';
        needsUpdate = false;
        premultiplyAlpha = false;
        flipY = false;
        offset = { y: 0 };
    }

    class MockMaterial {
        side = 0;
        visible = true;
        transparent = false;
        opacity = 1;
        alphaTest = 0;
        depthWrite = true;
        depthTest = true;
        metalness = 0;
        roughness = 0.5;
        color = { set: vi.fn(), getHex: vi.fn().mockReturnValue(0xffffff), getHexString: vi.fn().mockReturnValue('ffffff') };
        emissive = { set: vi.fn(), setHex: vi.fn(), getHex: vi.fn().mockReturnValue(0) };
        emissiveIntensity = 0;
        envMapIntensity = 0;
        needsUpdate = false;
        userData = { baseEmissive: 0.3 };
        dispose = vi.fn();
    }

    class MockMesh {
        name = 'mesh_part';
        material = new MockMaterial();
        castShadow = false;
        receiveShadow = false;
        frustumCulled = false;
        visible = true;
        position = { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 };
        rotation = { set: vi.fn(), x: 0, y: 0, z: 0 };
        scale = { setScalar: vi.fn(), set: vi.fn(), x: 1, y: 1, z: 1 };
        updateMatrixWorld = vi.fn();
        traverse(cb: (child: unknown) => void) {
            cb(this);
        }
    }

    class MockGroup {
        name = 'group';
        userData: Record<string, unknown> = { baseY: 0 };
        position = { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 };
        rotation = { set: vi.fn(), x: 0, y: 0, z: 0 };
        scale = { setScalar: vi.fn(), set: vi.fn(), x: 1, y: 1, z: 1 };
        children: unknown[] = [];
        add = vi.fn();
        remove = vi.fn();
        updateMatrixWorld = vi.fn();
        traverse(cb: (child: unknown) => void) {
            cb(this);
            cb(new MockMesh());
        }
        getObjectByName = vi.fn().mockReturnValue(null);
    }

    return {
        Scene: class {
            add = vi.fn();
            remove = vi.fn();
        },
        PerspectiveCamera: class {
            position = { set: vi.fn() };
            lookAt = vi.fn();
            updateProjectionMatrix = vi.fn();
            fov = 38;
            aspect = 1;
            near = 0.1;
            far = 100;
        },
        WebGLRenderer: class {
            get domElement() {
                return document.createElement('canvas');
            }
            setSize = vi.fn();
            setPixelRatio = vi.fn();
            setClearColor = vi.fn();
            render = vi.fn();
            dispose = vi.fn();
            toneMapping = 0;
            toneMappingExposure = 1;
            outputColorSpace = 'srgb';
        },
        AmbientLight: class {},
        HemisphereLight: class {},
        DirectionalLight: class {
            position = { set: vi.fn() };
        },
        PointLight: class {
            position = { set: vi.fn(), copy: vi.fn() };
            color = { set: vi.fn() };
            intensity = 1;
        },
        Group: MockGroup,
        Mesh: MockMesh,
        MeshStandardMaterial: MockMaterial,
        MeshPhysicalMaterial: MockMaterial,
        MeshBasicMaterial: MockMaterial,
        FileLoader: class {
            setResponseType = vi.fn();
            loadAsync = vi.fn().mockResolvedValue(new ArrayBuffer(8));
        },
        Box3: class {
            min = { x: 0, y: 0, z: 0 };
            max = { x: 1, y: 1, z: 1 };
            setFromObject = vi.fn().mockReturnThis();
            getSize = vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 });
            getCenter = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
        },
        Vector3: class {
            x = 0;
            y = 0;
            z = 0;
            set = vi.fn().mockReturnThis();
            sub = vi.fn().mockReturnThis();
            copy = vi.fn().mockReturnThis();
            clone() {
                return this;
            }
            project = vi.fn().mockReturnThis();
        },
        Color: class {
            set = vi.fn().mockReturnThis();
            getHex = vi.fn().mockReturnValue(0xffffff);
            getHexString = vi.fn().mockReturnValue('ffffff');
        },
        Clock: class {
            getDelta = vi.fn().mockReturnValue(0.016);
            getElapsedTime = vi.fn().mockReturnValue(1.0);
        },
        AnimationMixer: class {
            update = vi.fn();
            clipAction = vi.fn().mockReturnValue({
                reset: vi.fn().mockReturnThis(),
                setLoop: vi.fn().mockReturnThis(),
                play: vi.fn(),
                stop: vi.fn(),
                clampWhenFinished: false,
            });
            stopAllAction = vi.fn();
        },
        Texture: MockTexture,
        DoubleSide: 2,
        SRGBColorSpace: 'srgb',
        ACESFilmicToneMapping: 1,
        LoopOnce: 2200,
    };
});

vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
    GLTFLoader: class {
        parse = vi.fn().mockImplementation((_buffer: ArrayBuffer, _path: string, onLoad: (gltf: { scene: { name: string; userData: Record<string, unknown>; position: { set: () => void; sub: () => void; x: number; y: number; z: number }; rotation: { set: () => void; x: number; y: number; z: number }; scale: { setScalar: () => void }; updateMatrixWorld: () => void; traverse: (cb: (c: unknown) => void) => void; getObjectByName: () => unknown }; animations: unknown[] }) => void) => {
            onLoad({
                scene: {
                    name: 'mock_gltf_scene',
                    userData: { fromGltf: true, baseY: 0 },
                    position: { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 },
                    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
                    scale: { setScalar: vi.fn() },
                    updateMatrixWorld: vi.fn(),
                    traverse: vi.fn(),
                    getObjectByName: vi.fn().mockReturnValue(null),
                },
                animations: [],
            });
        });
    },
}));

vi.mock('@/components/Gacha/buildArcadeMachine', () => ({
    buildArcadeMachine: vi.fn().mockReturnValue({
        name: 'procedural_machine',
        userData: { baseY: 0 },
        traverse: vi.fn(),
        position: { sub: vi.fn(), set: vi.fn(), x: 0, y: 0, z: 0 },
        rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
        scale: { setScalar: vi.fn() },
        updateMatrixWorld: vi.fn(),
        getObjectByName: vi.fn().mockReturnValue(null),
    }),
    disposeArcadeMachine: vi.fn(),
}));

vi.mock('@/components/Gacha/screenReels', () => ({
    createScreenReels: vi.fn().mockReturnValue({
        ready: Promise.resolve(),
        update: vi.fn(),
        playSpin: vi.fn(),
        setStrips: vi.fn(),
        dispose: vi.fn(),
    }),
    bindScreenReels: vi.fn(),
}));

vi.mock('@/components/Gacha/gachaSpinSync', () => ({
    reelsToImageStrips: vi.fn().mockReturnValue([]),
}));

describe('Gacha3DShowcase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders pedestal, 3d canvas mount container and tier caption', () => {
        const { container } = renderWithProviders(
            <Gacha3DShowcase tierId="diamond" tierColor="#00e5ff" />
        );

        expect(container.querySelector('.gacha-3d-showcase')).toBeInTheDocument();
        expect(container.querySelector('.showcase-pedestal')).toBeInTheDocument();
        expect(container.querySelector('.three-container')).toBeInTheDocument();
        expect(container.querySelector('.showcase-caption')).toHaveTextContent('diamond cabinet');
    });

    it('applies is-spinning class when isOpening prop is true', () => {
        const { container } = renderWithProviders(
            <Gacha3DShowcase tierId="gold" tierColor="#ffd700" isOpening={true} />
        );

        const showcase = container.querySelector('.gacha-3d-showcase');
        expect(showcase).toHaveClass('is-spinning');
    });

    it('applies is-celebrating class when isCelebrating prop is true', () => {
        const { container } = renderWithProviders(
            <Gacha3DShowcase tierId="ultra" tierColor="#ff00ff" isCelebrating={true} />
        );

        const showcase = container.querySelector('.gacha-3d-showcase');
        expect(showcase).toHaveClass('is-celebrating');
    });

    it('cleans up without error on unmount', () => {
        const { unmount } = renderWithProviders(
            <Gacha3DShowcase tierId="emerald" tierColor="#10b981" />
        );

        expect(() => unmount()).not.toThrow();
        expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
});
