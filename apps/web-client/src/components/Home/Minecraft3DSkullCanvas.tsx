import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Minecraft3DSkullCanvasProps {
    className?: string;
    size?: number;
}

export const Minecraft3DSkullCanvas: React.FC<Minecraft3DSkullCanvasProps> = ({ className = '', size = 44 }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isSubscribed = true;
        const container = containerRef.current;
        if (!container) return;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
        camera.position.set(0, 0, 3.8);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        container.appendChild(renderer.domElement);

        // 2. Cinematic Lighting with Dramatic Red Bottom Under-glow
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        // Top Cyan Key Light
        const topCyanLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
        topCyanLight.position.set(2, 4, 3);
        scene.add(topCyanLight);

        // Intense Crimson Red Bottom Light (pointing UP from below)
        const bottomRedLight = new THREE.DirectionalLight(0xff1133, 4.8);
        bottomRedLight.position.set(0, -4, 2);
        scene.add(bottomRedLight);

        // Red Underglow PointLight right underneath the skull
        const redPointLight = new THREE.PointLight(0xff0022, 7.5, 8);
        redPointLight.position.set(0, -1.6, 1);
        scene.add(redPointLight);

        // 3. Main Group & GLTF Loader
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        let mixer: THREE.AnimationMixer | null = null;

        const loader = new GLTFLoader();
        loader.load('/models/toro_wither_skull.gltf', (gltf) => {
            if (!isSubscribed) return;

            const model = gltf.scene;

            // Hide hitbox/dummy meshes & enable pixel-art filtering
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const name = (child.name || '').toLowerCase();
                    const isHitboxName = name.includes('hitbox') || name.includes('collider') || name.includes('bounding');
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    const hasTextureMap = mats.some(m => m && m.map);

                    if (isHitboxName || !hasTextureMap) {
                        child.visible = false;
                    } else {
                        mats.forEach(mat => {
                            if (mat && mat.map) {
                                mat.map.magFilter = THREE.NearestFilter;
                                mat.map.minFilter = THREE.NearestFilter;
                            }
                            mat.side = THREE.DoubleSide;
                            mat.transparent = true;
                            mat.alphaTest = 0.05;
                        });
                    }
                }
            });

            // Center & Scale GLTF Model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const modelSize = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;
            const scale = 2.4 / maxDim;

            model.scale.set(scale, scale, scale);
            model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

            const skullPivot = new THREE.Group();
            skullPivot.add(model);
            skullPivot.rotation.y = Math.PI; // Face front
            mainGroup.add(skullPivot);

            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                const idleClip = gltf.animations.find(clip => clip.name.toLowerCase() === 'idle') || gltf.animations[0];
                if (idleClip) {
                    const action = mixer.clipAction(idleClip);
                    action.play();
                }
            }
        });

        // 4. Animation Loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            if (mixer) {
                mixer.update(delta);
            }

            // Subtle 3D floating & slight rotation
            mainGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.25;
            mainGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.06;

            renderer.render(scene, camera);
        };

        animate();

        // 5. Cleanup
        return () => {
            isSubscribed = false;
            cancelAnimationFrame(animationFrameId);
            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [size]);

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full flex items-center justify-center pointer-events-none ${className}`} 
        />
    );
};

export default Minecraft3DSkullCanvas;
