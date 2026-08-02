import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

let miniRackModelPromise: Promise<ICubePrecise[]> | null = null;
function loadRackModel(): Promise<ICubePrecise[]> {
    if (!miniRackModelPromise) {
        miniRackModelPromise = fetch('/models/server_rack_precise.json').then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
        });
    }
    return miniRackModelPromise;
}
loadRackModel().catch(() => {});

export const Minecraft3DServerRackMiniCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isSubscribed = true;

        // 1. Scene, Camera, Renderer for 48x48 Mini Icon
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.set(0, 0.4, 4.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(48, 48);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xe95420, 8, 10);
        pointLight.position.set(2, 2, 3);
        scene.add(pointLight);

        // 3. Main Server Group
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

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

        const invisibleMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const caseMat = new THREE.MeshStandardMaterial({ map: caseTex, roughness: 0.5, metalness: 0.2 });
        const serverMat = new THREE.MeshStandardMaterial({ map: serverTex, roughness: 0.4, metalness: 0.3 });
        const lightsMat = new THREE.MeshStandardMaterial({ 
            map: lightsTex, 
            emissiveMap: lightsTex,
            emissive: new THREE.Color('#ffffff'),
            emissiveIntensity: 0.6,
            roughness: 0.3
        });

        const matMap: Record<string, THREE.Material> = {
            case: caseMat,
            server: serverMat,
            lights: lightsMat,
            none: invisibleMat
        };

        loadRackModel()
            .then(data => {
                if (!isSubscribed) return;

                const cubes: ICubePrecise[] = (data as { cubes?: ICubePrecise[] }).cubes || [];

                cubes.forEach((cube: ICubePrecise) => {
                    const [w, h, d] = cube.size;
                    const [px, py, pz] = cube.position;

                    const geo = new THREE.BoxGeometry(w, h, d);
                    const faceMaterials: THREE.Material[] = [
                        invisibleMat, invisibleMat, invisibleMat, 
                        invisibleMat, invisibleMat, invisibleMat
                    ];

                    const uvAttr = geo.attributes.uv;

                    cube.faces.forEach((face) => {
                        const idx = face.three_idx;
                        const texKey = face.texture;
                        const mat = matMap[texKey] || invisibleMat;
                        faceMaterials[idx] = mat;

                        if (texKey !== 'none') {
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
                    });

                    uvAttr.needsUpdate = true;

                    const mesh = new THREE.Mesh(geo, faceMaterials);
                    mesh.position.set(px, py, pz);
                    mainGroup.add(mesh);
                });

                mainGroup.scale.set(1.9, 1.9, 1.9);
                mainGroup.rotation.y = Math.PI - 0.35;
                mainGroup.rotation.x = 0.15;
            })
            .catch(() => {});

        // 4. Animation Loop
        const clock = new THREE.Clock();
        let lastFrameTime = 0;
        let currentFrame = 0;

        let animationFrameId: number;
        const animate = () => {
            if (!isSubscribed) return;
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Keep model still facing front (no rotation)
            // Shift texture V offset by 16/128 (1/8) for LED blinking animation
            if (elapsedTime - lastFrameTime > 0.15) {
                currentFrame = (currentFrame + 1) % 8;
                lightsTex.offset.y = -(currentFrame * (16 / 128));
                lastFrameTime = elapsedTime;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            isSubscribed = false;
            cancelAnimationFrame(animationFrameId);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="w-12 h-12 flex items-center justify-center pointer-events-none"
        />
    );
};

export default Minecraft3DServerRackMiniCanvas;
