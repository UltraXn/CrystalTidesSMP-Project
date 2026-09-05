import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ReactMarkdown from 'react-markdown';
import { ShoppingBag, Coins, Store, Shield, Compass, MapPin, Maximize2, RotateCcw } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUtils';

export interface WikiMerchant3DCardProps {
    minimal3dOnly?: boolean;
    modelPath?: string;
    bossName?: string;
    subtitle?: string;
    hp?: string;
    currency?: string;
    location?: string;
    description?: string;
    trades?: string[];
}

export const WikiMerchant3DCard: React.FC<WikiMerchant3DCardProps> = ({
    minimal3dOnly = false,
    modelPath = '/models/ribbits/ribbit_merchant.gltf',
    bossName = 'Merchant Ribbit',
    subtitle = 'Mercader Ambulante',
    hp = '30 HP (Protegido)',
    currency = 'KilluCoins (KC) / Esmeraldas',
    location = 'Pantanos, Ríos y Aldeas',
    description = 'Comerciante itinerante de la raza Ribbit que ofrece semillas exóticas y artefactos de pesca.',
    trades = ['Semillas Raras', 'Señuelos Míticos', 'Ingredientes de Alquimia']
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isDraggingRef = useRef(false);
    const previousMousePositionRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0.15, y: 0.8 });

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);

    const resetView = useCallback(() => {
        targetRotationRef.current = { x: 0.15, y: 0.8 };
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current?.parentElement) return;
        if (!document.fullscreenElement) {
            containerRef.current.parentElement.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        setIsLoading(true);

        const width = containerRef.current.clientWidth || 400;
        const height = containerRef.current.clientHeight || 350;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 1.2, 3.8);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const amberLight = new THREE.DirectionalLight(0xf59e0b, 2.0);
        amberLight.position.set(3, 5, 4);
        scene.add(amberLight);

        const purpleFill = new THREE.PointLight(0x8b5cf6, 1.5, 10);
        purpleFill.position.set(-3, 2, -2);
        scene.add(purpleFill);

        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelGroupRef.current = modelGroup;

        const createProceduralFallback = () => {
            const geo = new THREE.OctahedronGeometry(0.8, 0);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                wireframe: true,
                emissive: 0xd97706,
                emissiveIntensity: 0.6
            });
            const mesh = new THREE.Mesh(geo, mat);
            modelGroup.add(mesh);
            setIsLoading(false);
        };

        const loader = new GLTFLoader();
        loader.load(
            resolveAssetUrl(modelPath),
            (gltf) => {
                modelGroup.clear();
                const loadedModel = gltf.scene;

                loadedModel.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        if (mesh.material) {
                            const mat = mesh.material as THREE.MeshStandardMaterial;
                            mat.roughness = 0.6;
                            mat.metalness = 0.1;
                        }
                    }
                });

                const box = new THREE.Box3().setFromObject(loadedModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z) || 1;

                const targetHeight = 2.0;
                const scale = targetHeight / maxDim;
                loadedModel.scale.setScalar(scale);
                loadedModel.position.set(-center.x * scale, -center.y * scale - 0.2, -center.z * scale);

                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(loadedModel);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                    mixerRef.current = mixer;
                }

                modelGroup.add(loadedModel);
                setIsLoading(false);
            },
            undefined,
            (err) => {
                console.warn('GLTF load failed, using procedural fallback:', err);
                createProceduralFallback();
            }
        );

        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            if (mixerRef.current) mixerRef.current.update(delta);

            if (modelGroupRef.current) {
                modelGroupRef.current.rotation.x += (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.08;
                modelGroupRef.current.rotation.y += (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.08;
            }

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, [modelPath]);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x + deltaY * 0.01));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    if (minimal3dOnly) {
        return (
            <div className="relative w-full h-full min-h-80 bg-radial from-amber-950/20 via-black to-black flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden border border-amber-500/20 rounded-2xl">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-20">
                        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-2" />
                        <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">Cargando 3D...</span>
                    </div>
                )}
                <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />
            </div>
        );
    }

    return (
        <div className="w-full my-1">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#120e06]/90 shadow-xl backdrop-blur-xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                    {/* 3D Viewport Column */}
                    <div
                        tabIndex={0}
                        role="region"
                        aria-label="Visualizador 3D Mercader"
                        className="lg:col-span-5 relative w-full h-full min-h-95 bg-radial from-amber-950/30 via-black to-black flex items-center justify-center cursor-grab active:cursor-grabbing border-b lg:border-b-0 lg:border-r border-amber-500/20 overflow-hidden outline-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-20">
                                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-2" />
                                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">Cargando 3D...</span>
                            </div>
                        )}

                        <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

                        {/* Controls */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                            <button type="button" onClick={resetView} aria-label="Reiniciar cámara" className="p-1.5 rounded-lg bg-black/60 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer" title="Reiniciar Cámara">
                                <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={toggleFullscreen} aria-label="Pantalla completa" className="p-1.5 rounded-lg bg-black/60 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer" title="Pantalla Completa">
                                <Maximize2 aria-hidden="true" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats & Description Column */}
                    <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-3">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest mb-1.5">
                                <ShoppingBag className="w-3 h-3" /> Ribbits & Traders • {subtitle}
                            </div>

                            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                                {bossName}
                            </h2>

                            {description && (
                                <div className="text-[11px] text-gray-300 leading-relaxed font-medium mb-3 space-y-1.5 [&_p]:mb-1">
                                    <ReactMarkdown>{description.replace(/\\n/g, '\n')}</ReactMarkdown>
                                </div>
                            )}

                            {/* Attributes Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                        <Coins className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">Moneda de Cambio</div>
                                        <div className="text-[11px] font-bold text-amber-300">
                                            {currency}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                        <Store className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">Especialidad de Tienda</div>
                                        <div className="text-[11px] font-bold text-white">
                                            Mercader de Pantano & Ríos
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Shield className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">Resistencia NPC</div>
                                        <div className="text-[11px] font-bold text-white">
                                            {hp}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Compass className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">Disponibilidad</div>
                                        <div className="text-[11px] font-bold text-white">
                                            Encuentro Frecuente
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trade Catalogue Sheet */}
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2 mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                                        <ShoppingBag size={13} /> Catálogo de Intercambio Offered
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-mono">Tienda de Aldea</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {trades.map((item) => (
                                        <span key={item} className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200 text-[10px] font-bold flex items-center gap-1">
                                            🪙 {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                    <MapPin size={12} /> Ubicación de Encuentro
                                </div>
                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                    <strong className="text-white">Ubicación:</strong> {location}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WikiMerchant3DCard;
