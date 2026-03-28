import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Gacha3DShowcaseProps {
    tierColor: string;
    modelUrl?: string;
}

const Gacha3DShowcase: React.FC<Gacha3DShowcaseProps> = ({ tierColor, modelUrl }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        const width = 260;
        const height = 340;
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(tierColor, 2, 10);
        pointLight.position.set(2, 3, 4);
        scene.add(pointLight);

        const blueLight = new THREE.PointLight('#00f2ff', 1, 10);
        blueLight.position.set(-2, 1, 2);
        scene.add(blueLight);

        // Placeholder Crystal if no modelUrl
        let placeholder: THREE.Mesh;
        if (!modelUrl) {
            const geometry = new THREE.OctahedronGeometry(1.5, 0);
            const material = new THREE.MeshPhongMaterial({
                color: tierColor,
                emissive: tierColor,
                emissiveIntensity: 0.5,
                shininess: 100,
                transparent: true,
                opacity: 0.8,
                wireframe: false
            });
            placeholder = new THREE.Mesh(geometry, material);
            scene.add(placeholder);
        } else {
            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;
                scene.add(model);
                
                // Center & scale model
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
                
                // Ensure model isn't too huge
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 3.5) {
                    const scale = 3.5 / maxDim;
                    model.scale.set(scale, scale, scale);
                }
            });
        }

        camera.position.z = 5;

        let frameId: number;

        // Animation
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            
            if (modelRef.current) {
                modelRef.current.rotation.y += 0.01;
            } else if (placeholder) {
                placeholder.rotation.y += 0.015;
                placeholder.rotation.x += 0.005;
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        const mountNode = mountRef.current;
        return () => {
            cancelAnimationFrame(frameId);
            if (mountNode) {
                mountNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
            // Free up memory
            if (modelRef.current) {
                modelRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };
    }, [modelUrl, tierColor]);

    // Update lighting color when tier changes
    useEffect(() => {
        if (sceneRef.current) {
            sceneRef.current.traverse((child) => {
                if (child instanceof THREE.PointLight && child.position.x === 2) {
                    child.color.set(tierColor);
                }
            });
        }
    }, [tierColor]);

    return (
        <div className="gacha-3d-showcase">
            <div className="showcase-pedestal">
                <div className="pedestal-top"></div>
                <div className="pedestal-glow" style={{ '--tier-color': tierColor } as React.CSSProperties}></div>
            </div>
            <div ref={mountRef} className="three-container" />
            
            <style>{`
                .gacha-3d-showcase {
                    position: relative;
                    width: 260px;
                    height: 380px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    filter: drop-shadow(0 0 30px rgba(0,0,0,0.4));
                }

                .three-container {
                    width: 100%;
                    height: 100%;
                    z-index: 2;
                }

                .showcase-pedestal {
                    position: absolute;
                    bottom: 60px;
                    width: 180px;
                    height: 24px;
                    z-index: 1;
                }

                .pedestal-top {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 50%;
                    box-shadow: 
                        0 5px 15px rgba(0,0,0,0.8),
                        inset 0 0 10px rgba(139, 92, 246, 0.2);
                }

                .pedestal-glow {
                    position: absolute;
                    inset: -30px;
                    background: radial-gradient(circle, var(--tier-color) 0%, transparent 70%);
                    opacity: 0.6;
                    filter: blur(20px);
                    animation: pulse 2s infinite alternate;
                }

                .three-container::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
                    pointer-events: none;
                    z-index: 1;
                    opacity: ${tierColor === '#6366f1' ? 1 : 0.5};
                    transition: opacity 0.5s;
                }

                @keyframes pulse {
                    from { transform: scale(0.95) translateY(2px); opacity: 0.4; }
                    to { transform: scale(1.05) translateY(-2px); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default Gacha3DShowcase;
