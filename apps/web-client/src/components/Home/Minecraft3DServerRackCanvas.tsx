import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Minecraft3DServerRackCanvasProps {
    accentColor?: string;
}

interface IFaceInfo {
    three_idx: number;
    mc_face: string;
    texture: string;
    uv: [number, number, number, number];
    rotation: number;
}

interface ICubePrecise {
    name: string;
    size: [number, number, number];
    position: [number, number, number];
    faces: IFaceInfo[];
}

let rackModelPromise: Promise<ICubePrecise[]> | null = null;
function loadRackModel(): Promise<ICubePrecise[]> {
    rackModelPromise ??= fetch('/models/server_rack_precise.json').then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
    });
    return rackModelPromise;
}
loadRackModel().catch(() => {});

function applyFaceUV(
    face: IFaceInfo, 
    uvAttr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, 
    matMap: Record<string, THREE.Material>, 
    invisibleMat: THREE.Material, 
    faceMaterials: THREE.Material[]
): void {
    const idx = face.three_idx;
    const texKey = face.texture;
    faceMaterials[idx] = matMap[texKey] || invisibleMat;

    if (texKey === 'none') return;

    const [u1, v1, u2, v2] = face.uv;
    const offset = idx * 4;

    if (face.rotation === 90) {
        uvAttr.setXY(offset + 0, u1, 1 - v2);
        uvAttr.setXY(offset + 1, u2, 1 - v2);
        uvAttr.setXY(offset + 2, u1, 1 - v1);
        uvAttr.setXY(offset + 3, u2, 1 - v1);
    } else if (face.mc_face === 'north') {
        uvAttr.setXY(offset + 0, u2, 1 - v1);
        uvAttr.setXY(offset + 1, u1, 1 - v1);
        uvAttr.setXY(offset + 2, u2, 1 - v2);
        uvAttr.setXY(offset + 3, u1, 1 - v2);
    } else {
        uvAttr.setXY(offset + 0, u1, 1 - v1);
        uvAttr.setXY(offset + 1, u1, 1 - v2);
        uvAttr.setXY(offset + 2, u2, 1 - v1);
        uvAttr.setXY(offset + 3, u2, 1 - v2);
    }
}

function buildRackGroup(
    cubes: ICubePrecise[], 
    matMap: Record<string, THREE.Material>, 
    invisibleMat: THREE.Material
): THREE.Group {
    const rackGroup = new THREE.Group();

    for (const cube of cubes) {
        const [w, h, d] = cube.size;
        const [px, py, pz] = cube.position;

        const geo = new THREE.BoxGeometry(w, h, d);
        const faceMaterials: THREE.Material[] = [
            invisibleMat, invisibleMat, invisibleMat, 
            invisibleMat, invisibleMat, invisibleMat
        ];

        const uvAttr = geo.attributes.uv;

        for (const face of cube.faces) {
            applyFaceUV(face, uvAttr, matMap, invisibleMat, faceMaterials);
        }

        uvAttr.needsUpdate = true;

        const mesh = new THREE.Mesh(geo, faceMaterials);
        mesh.position.set(px, py, pz);
        rackGroup.add(mesh);
    }

    return rackGroup;
}

export const Minecraft3DServerRackCanvas: React.FC<Minecraft3DServerRackCanvasProps> = ({ accentColor = '#f59e0b' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isSubscribed = true;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0.3, 6.8);
        camera.lookAt(0, 0.3, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Lighting Setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const brandColor = new THREE.Color(accentColor);
        const pointLight1 = new THREE.PointLight(brandColor, 8, 14);
        pointLight1.position.set(3, 3, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00e5ff, 5, 14);
        pointLight2.position.set(-3, -2, 3);
        scene.add(pointLight2);

        // 3. Main Container Group
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // Load textures with nearest pixel-art filter
        const textureLoader = new THREE.TextureLoader();
        const caseTex = textureLoader.load('/models/server_rack/case.png', (t) => {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
            t.colorSpace = THREE.SRGBColorSpace;
        });
        const serverTex = textureLoader.load('/models/server_rack/server.png', (t) => {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
            t.colorSpace = THREE.SRGBColorSpace;
        });
        const lightsTex = textureLoader.load('/models/server_rack/server_lights.png', (t) => {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
            t.colorSpace = THREE.SRGBColorSpace;
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
        });

        // Base materials
        const invisibleMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const caseMat = new THREE.MeshStandardMaterial({ map: caseTex, roughness: 0.5, metalness: 0.2 });
        const serverMat = new THREE.MeshStandardMaterial({ map: serverTex, roughness: 0.4, metalness: 0.3 });
        const lightsMat = new THREE.MeshStandardMaterial({ 
            map: lightsTex, 
            emissiveMap: lightsTex,
            emissive: new THREE.Color('#ffffff'),
            emissiveIntensity: 0.5,
            roughness: 0.3
        });

        const matMap: Record<string, THREE.Material> = {
            case: caseMat,
            server: serverMat,
            lights: lightsMat,
            none: invisibleMat
        };

        let centerRack: THREE.Group | null = null;

        // Fetch precise server rack JSON data & instantiate single centered floating rack
        loadRackModel()
            .then(data => {
                if (!isSubscribed) return;

                const cubes: ICubePrecise[] = (data as { cubes?: ICubePrecise[] }).cubes || [];

                // Single Centered Floating Server Rack (Lifted high into upper half of card)
                centerRack = buildRackGroup(cubes, matMap, invisibleMat);
                centerRack.position.set(0, 1.25, 0);
                centerRack.scale.set(1.5, 1.5, 1.5);
                mainGroup.add(centerRack);
            })
            .catch(() => {});

        // 4. Mouse Interactive Drag Rotation (Starts facing FRONT directly towards user)
        let targetRotationY = Math.PI - 0.35;
        let targetRotationX = 0.15;
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;

            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;

            targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        const domElem = renderer.domElement;
        domElem.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // 5. Animation Loop with Gentle Floating & Fast LED Blinking (150ms per frame)
        const clock = new THREE.Clock();
        let lastFrameTime = 0;
        let currentFrame = 0;
        const frameDuration = 0.15;

        let animationFrameId: number;
        const animate = () => {
            if (!isSubscribed) return;
            animationFrameId = requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            if (!isDragging) {
                targetRotationY += 0.24 * delta;
            }

            const lerpFactor = 1 - Math.exp(-5 * delta);
            mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * lerpFactor;
            mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * lerpFactor;

            // Gentle floating motion for centered server rack
            if (centerRack) {
                centerRack.position.y = 1.25 + Math.sin(elapsedTime * 1.8) * 0.08;
            }

            // Shift texture V offset by 16/128 (1/8) to cycle through the 8 LED animation frames
            if (elapsedTime - lastFrameTime > frameDuration) {
                currentFrame = (currentFrame + 1) % 8;
                lightsTex.offset.y = -(currentFrame * (16 / 128));
                lastFrameTime = elapsedTime;
            }

            // Subtle glow pulse
            const pulse = 0.4 + Math.sin(elapsedTime * 6) * 0.15;
            lightsMat.emissiveIntensity = pulse;

            renderer.render(scene, camera);
        };

        animate();

        // Handle Window Resize
        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            isSubscribed = false;
            cancelAnimationFrame(animationFrameId);
            domElem.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('resize', handleResize);
            domElem.remove();
            renderer.dispose();
        };
    }, [accentColor]);

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full min-h-65 sm:min-h-75 cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
        />
    );
};

export default Minecraft3DServerRackCanvas;
