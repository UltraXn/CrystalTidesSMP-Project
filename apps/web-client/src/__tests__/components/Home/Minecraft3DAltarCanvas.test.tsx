import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import { Minecraft3DAltarCanvas } from '@/components/Home/Minecraft3DAltarCanvas';

vi.mock('three', () => {
    class MockTexture {
        magFilter = 0;
        minFilter = 0;
        wrapS = 0;
        wrapT = 0;
        repeat = { set: vi.fn() };
        offset = { set: vi.fn(), y: 0 };
    }

    return {
        Scene: class {
            add = vi.fn();
            remove = vi.fn();
        },
        PerspectiveCamera: class {
            position = { set: vi.fn(), z: 5 };
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
            color = { lerp: vi.fn() };
        },
        Group: class {
            add = vi.fn();
            position = { set: vi.fn(), x: 0, y: 0, z: 0 };
            rotation = { set: vi.fn(), y: 0 };
            scale = { set: vi.fn() };
        },
        BoxGeometry: class {
            translate = vi.fn();
            dispose = vi.fn();
        },
        PlaneGeometry: class {
            attributes = { uv: { setXY: vi.fn() } };
            dispose = vi.fn();
        },
        RingGeometry: class {
            dispose = vi.fn();
        },
        BufferGeometry: class {
            setAttribute = vi.fn();
            setIndex = vi.fn();
            dispose = vi.fn();
            attributes = {
                position: { array: new Float32Array(300), needsUpdate: false },
                color: { array: new Float32Array(300), needsUpdate: false },
            };
        },
        BufferAttribute: class {},
        WireframeGeometry: class {
            dispose = vi.fn();
        },
        LineSegments: class {},
        LineBasicMaterial: class {
            dispose = vi.fn();
        },
        MeshBasicMaterial: class {
            opacity = 1;
            color = { lerp: vi.fn() };
            dispose = vi.fn();
        },
        MeshStandardMaterial: class {
            dispose = vi.fn();
        },
        PointsMaterial: class {
            opacity = 1;
            color = { lerp: vi.fn() };
            dispose = vi.fn();
        },
        Mesh: class {
            position = { set: vi.fn(), x: 0, y: 0, z: 0 };
            rotation = { set: vi.fn(), y: 0, z: 0 };
            scale = { set: vi.fn() };
            geometry = {
                dispose: vi.fn(),
                attributes: {
                    position: { array: new Float32Array(300), needsUpdate: false },
                    color: { array: new Float32Array(300), needsUpdate: false },
                },
            };
            material = { opacity: 1, color: { lerp: vi.fn() }, dispose: vi.fn() };
            add = vi.fn();
            renderOrder = 0;
        },
        Points: class {
            geometry = {
                dispose: vi.fn(),
                attributes: {
                    position: { array: new Float32Array(300), needsUpdate: false },
                },
            };
            material = { opacity: 1, dispose: vi.fn() };
            rotation = { x: 0, y: 0 };
        },
        AnimationMixer: class {
            update = vi.fn();
            clipAction = vi.fn().mockReturnValue({
                play: vi.fn(),
            });
        },
        Color: class {
            set = vi.fn().mockReturnThis();
            lerp = vi.fn().mockReturnThis();
            copy = vi.fn().mockReturnThis();
        },
        Vector3: class {
            x = 0;
            y = 0;
            z = 0;
            set = vi.fn().mockReturnThis();
            copy = vi.fn().mockReturnThis();
            add = vi.fn().mockReturnThis();
            sub = vi.fn().mockReturnThis();
            subVectors = vi.fn().mockReturnThis();
            crossVectors = vi.fn().mockReturnThis();
            normalize = vi.fn().mockReturnThis();
            multiplyScalar = vi.fn().mockReturnThis();
            lengthSq = vi.fn().mockReturnValue(1);
            unproject = vi.fn().mockReturnThis();
        },
        Box3: class {
            setFromObject = vi.fn().mockReturnThis();
            getSize = vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 });
            getCenter = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
        },
        Clock: class {
            getDelta = vi.fn().mockReturnValue(0.016);
            getElapsedTime = vi.fn().mockReturnValue(1.0);
        },
        TextureLoader: class {
            load = vi.fn().mockReturnValue(new MockTexture());
        },
        CanvasTexture: class extends MockTexture {},
        MathUtils: {
            lerp: (a: number, b: number, t: number) => a + (b - a) * t,
        },
        NearestFilter: 1003,
        DoubleSide: 2,
        AdditiveBlending: 2,
        RepeatWrapping: 1000,
    };
});

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

describe('Minecraft3DAltarCanvas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders stage 2 beacon altar with linked members', () => {
        const { container } = renderWithProviders(
            <Minecraft3DAltarCanvas
                stageId={2}
                accentColor="#89d9d1"
                linkedMembersList={['KillubysmaliVT', 'Neroferno ultranix']}
            />
        );

        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('renders stage 3 wither model without crashing', () => {
        const { container } = renderWithProviders(
            <Minecraft3DAltarCanvas stageId={3} accentColor="#ff4444" />
        );

        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('renders default block stage (stage 1) correctly', () => {
        const { container } = renderWithProviders(
            <Minecraft3DAltarCanvas stageId={1} accentColor="#00e5ff" />
        );

        expect(container.querySelector('canvas')).toBeInTheDocument();
    });
});
