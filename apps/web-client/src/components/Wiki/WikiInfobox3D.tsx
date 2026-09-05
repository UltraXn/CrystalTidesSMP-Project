import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { 
    Heart, Swords, Shield, Zap, MapPin, Coins, 
    RotateCcw, Sparkles, Layers, AlertTriangle
} from 'lucide-react'
import { WikiArticle } from '../../services/wikiService'
import { resolveAssetUrl } from '../../utils/assetUtils'

interface WikiInfobox3DProps {
    article: WikiArticle
}

export default function WikiInfobox3D({ article }: WikiInfobox3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [activePhase, setActivePhase] = useState<number>(1)
    const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true)
    const [modelError, setModelError] = useState<string | null>(null)
    const [hasMultiplePhases, setHasMultiplePhases] = useState<boolean>(false)

    // Three.js instances
    const sceneRef = useRef<THREE.Scene | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const currentModelRef = useRef<THREE.Object3D | null>(null)
    const mixerRef = useRef<THREE.AnimationMixer | null>(null)
    const reqIdRef = useRef<number>(0)
    const clockRef = useRef<THREE.Clock>(new THREE.Clock())
    const isDraggingRef = useRef(false)
    const previousMousePositionRef = useRef({ x: 0, y: 0 })

    const modelPath = activePhase === 2 && article.model_3d_url_phase_2 
        ? article.model_3d_url_phase_2 
        : article.model_3d_url

    useEffect(() => {
        setHasMultiplePhases(Boolean(article.model_3d_url_phase_2 || (article.boss_phases && article.boss_phases.length > 1)))
    }, [article])

    // Initialize Three.js Scene
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const container = containerRef.current
        const width = container.clientWidth || 320
        const height = 260

        // Scene
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Camera
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
        camera.position.set(0, 1.2, 3.5)
        cameraRef.current = camera

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.2
        renderer.outputColorSpace = THREE.SRGBColorSpace
        rendererRef.current = renderer

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
        scene.add(ambientLight)

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
        dirLight.position.set(4, 8, 4)
        scene.add(dirLight)

        const backLight = new THREE.DirectionalLight(0x89d9d1, 1.2)
        backLight.position.set(-4, -2, -4)
        scene.add(backLight)

        // Subtle Pedestal Ring with CrystalTides Mint
        const ringGeo = new THREE.RingGeometry(1.1, 1.15, 32)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x89d9d1, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
        const ringMesh = new THREE.Mesh(ringGeo, ringMat)
        ringMesh.rotation.x = -Math.PI / 2
        ringMesh.position.y = -0.02
        scene.add(ringMesh)

        // Grid floor
        const gridHelper = new THREE.GridHelper(3, 8, 0x168c80, 0x0c5952)
        gridHelper.position.y = -0.03
        scene.add(gridHelper)

        // Animation Loop
        const animate = () => {
            reqIdRef.current = requestAnimationFrame(animate)
            const delta = clockRef.current.getDelta()

            if (mixerRef.current) {
                mixerRef.current.update(delta)
            }

            if (currentModelRef.current && !isDraggingRef.current) {
                currentModelRef.current.rotation.y += 0.006
            }

            renderer.render(scene, camera)
        }
        animate()

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
            const w = containerRef.current.clientWidth || 320
            const h = 260
            cameraRef.current.aspect = w / h
            cameraRef.current.updateProjectionMatrix()
            rendererRef.current.setSize(w, h)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(reqIdRef.current)
            window.removeEventListener('resize', handleResize)
            renderer.dispose()
        }
    }, [])

    // Load GLTF Model
    useEffect(() => {
        if (!modelPath || !sceneRef.current) return

        setIsLoadingModel(true)
        setModelError(null)

        if (currentModelRef.current && sceneRef.current) {
            sceneRef.current.remove(currentModelRef.current)
            currentModelRef.current = null
        }
        if (mixerRef.current) {
            mixerRef.current.stopAllAction()
            mixerRef.current = null
        }

        const loader = new GLTFLoader()
        const resolvedUrl = resolveAssetUrl(modelPath)

        loader.load(
            resolvedUrl,
            (gltf) => {
                if (!sceneRef.current) return
                const model = gltf.scene

                const box = new THREE.Box3().setFromObject(model)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                const maxDim = Math.max(size.x, size.y, size.z)
                const scale = 1.8 / (maxDim || 1)
                model.scale.setScalar(scale)

                model.position.x = -center.x * scale
                model.position.y = -box.min.y * scale
                model.position.z = -center.z * scale

                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material]
                        mats.forEach(mat => {
                            if (mat.map) {
                                mat.map.magFilter = THREE.NearestFilter
                                mat.map.minFilter = THREE.NearestFilter
                                mat.map.needsUpdate = true
                            }
                            mat.side = THREE.DoubleSide
                        })
                    }
                })

                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model)
                    mixerRef.current = mixer
                    const action = mixer.clipAction(gltf.animations[0])
                    action.play()
                }

                sceneRef.current.add(model)
                currentModelRef.current = model
                setIsLoadingModel(false)
            },
            undefined,
            (error) => {
                console.warn('Failed to load GLTF in infobox:', error)
                setModelError('Modelo no disponible')
                setIsLoadingModel(false)
            }
        )
    }, [modelPath])

    // Mouse Drag Rotation
    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current || !currentModelRef.current) return
        const deltaX = e.clientX - previousMousePositionRef.current.x
        const deltaY = e.clientY - previousMousePositionRef.current.y

        currentModelRef.current.rotation.y += deltaX * 0.01
        currentModelRef.current.rotation.x += deltaY * 0.01

        currentModelRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, currentModelRef.current.rotation.x))

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        isDraggingRef.current = false
    }

    const resetRotation = () => {
        if (currentModelRef.current) {
            currentModelRef.current.rotation.set(0, 0, 0)
        }
    }

    return (
        <aside aria-label={`Ficha técnica de ${article.title}`} className="w-full lg:w-84 shrink-0 bg-[#0b0c10]/90 border border-[#168c80]/40 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-5 sticky top-24 self-start">
            {/* Infobox Header */}
            <div className="text-center pb-3 border-b border-white/10">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#168c80]/20 border border-[#89d9d1]/40 text-(--accent) text-[10px] font-black uppercase tracking-widest mb-2 shadow-inner">
                    <Sparkles size={11} aria-hidden="true" />
                    <span>Ficha de Entidad Oficial</span>
                </div>
                <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                    {article.title}
                </h2>
                {article.boss_mod_name && (
                    <p className="text-xs text-white/60 font-semibold mt-0.5 flex items-center justify-center gap-1">
                        <Layers size={12} aria-hidden="true" className="text-(--accent)" />
                        <span>{article.boss_mod_name}</span>
                    </p>
                )}
            </div>

            {/* 3D Model Specimen Viewport */}
            {article.model_3d_url && (
                <div className="relative rounded-2xl bg-black/60 border border-white/10 overflow-hidden shadow-inner">
                    <div 
                        ref={containerRef}
                        className="w-full h-65 cursor-grab active:cursor-grabbing relative flex items-center justify-center"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <canvas ref={canvasRef} role="img" aria-label={`Modelo 3D interactivo de ${article.title}`} className="w-full h-full block" />

                        {isLoadingModel && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm text-(--accent) gap-2">
                                <Sparkles size={24} aria-hidden="true" className="animate-spin text-(--accent)" />
                                <span className="text-[11px] font-bold">Invocando Modelo 3D...</span>
                            </div>
                        )}

                        {modelError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-amber-400 gap-2 p-4 text-center">
                                <AlertTriangle size={24} aria-hidden="true" />
                                <span className="text-xs font-bold">{modelError}</span>
                            </div>
                        )}

                        {/* Viewport Floating Controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={resetRotation}
                                aria-label="Restablecer rotación 3D"
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-[#168c80]/40 text-white/70 hover:text-(--accent) border border-white/10 text-xs transition-colors cursor-pointer"
                                title="Restablecer Rotación"
                            >
                                <RotateCcw size={13} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/40 tracking-wider">
                            Arrastra para rotar 360°
                        </div>
                    </div>

                    {/* Phase Switcher */}
                    {hasMultiplePhases && (
                        <div className="p-2 bg-[#06070b]/90 border-t border-white/10 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                aria-pressed={activePhase === 1}
                                onClick={() => setActivePhase(1)}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    activePhase === 1
                                        ? 'bg-[#168c80] text-white shadow-md'
                                        : 'bg-white/5 text-white/50 hover:text-white'
                                }`}
                            >
                                Fase 1
                            </button>
                            <button
                                type="button"
                                aria-pressed={activePhase === 2}
                                onClick={() => setActivePhase(2)}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    activePhase === 2
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-white/5 text-white/50 hover:text-white'
                                }`}
                            >
                                Fase 2 (Frenesí)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Structured Key-Value Data Table */}
            <div className="space-y-2 text-xs">
                <div className="font-black text-[11px] uppercase tracking-wider text-(--accent) pb-1 border-b border-white/10">
                    Estadísticas & Atributos
                </div>

                <div className="space-y-1.5 divide-y divide-white/5">
                    {/* Category */}
                    <div className="flex justify-between items-center pt-1.5">
                        <span className="text-white/50 font-medium">Categoría</span>
                        <span className="font-bold text-white capitalize">
                            {article.category?.replace(/_/g, ' ') || 'General'}
                        </span>
                    </div>

                    {/* Health */}
                    {article.boss_hp && (
                        <div className="flex justify-between items-center pt-1.5">
                            <span className="text-white/50 flex items-center gap-1.5 font-medium">
                                <Heart size={13} aria-hidden="true" className="text-red-400" /> Puntos de Vida
                            </span>
                            <span className="font-black text-red-300 font-mono tabular-nums">
                                {activePhase === 2 && article.boss_hp_phase_2 ? article.boss_hp_phase_2 : article.boss_hp}
                            </span>
                        </div>
                    )}

                    {/* Damage */}
                    {article.boss_damage && (
                        <div className="flex justify-between items-center pt-1.5">
                            <span className="text-white/50 flex items-center gap-1.5 font-medium">
                                <Swords size={13} aria-hidden="true" className="text-amber-400" /> Poder de Ataque
                            </span>
                            <span className="font-bold text-amber-200 text-right truncate max-w-35 tabular-nums">
                                {activePhase === 2 && article.boss_damage_phase_2 ? article.boss_damage_phase_2 : article.boss_damage}
                            </span>
                        </div>
                    )}

                    {/* Armor */}
                    {article.boss_armor && (
                        <div className="flex justify-between items-center pt-1.5">
                            <span className="text-white/50 flex items-center gap-1.5 font-medium">
                                <Shield size={13} aria-hidden="true" className="text-blue-400" /> Armadura
                            </span>
                            <span className="font-semibold text-white/90 text-right truncate max-w-35 tabular-nums">
                                {article.boss_armor}
                            </span>
                        </div>
                    )}

                    {/* Speed */}
                    {article.boss_speed && (
                        <div className="flex justify-between items-center pt-1.5">
                            <span className="text-white/50 flex items-center gap-1.5 font-medium">
                                <Zap size={13} aria-hidden="true" className="text-yellow-400" /> Velocidad
                            </span>
                            <span className="font-mono text-white/80 tabular-nums">
                                {article.boss_speed}
                            </span>
                        </div>
                    )}

                    {/* Habitat / Location */}
                    {article.boss_location && (
                        <div className="flex justify-between items-start pt-1.5 gap-2">
                            <span className="text-white/50 flex items-center gap-1.5 font-medium shrink-0">
                                <MapPin size={13} aria-hidden="true" className="text-(--accent)" /> Hábitat
                            </span>
                            <span className="font-medium text-white/90 text-right">
                                {article.boss_location}
                            </span>
                        </div>
                    )}

                    {/* Spawn Method */}
                    {article.boss_spawn_method && (
                        <div className="flex justify-between items-start pt-1.5 gap-2">
                            <span className="text-white/50 font-medium shrink-0">Aparición</span>
                            <span className="font-medium text-white/80 text-right text-[11px]">
                                {article.boss_spawn_method}
                            </span>
                        </div>
                    )}

                    {/* KilluCoins Bounty */}
                    {article.boss_kc_reward ? (
                        <div className="flex justify-between items-center pt-2 pb-1 bg-amber-500/10 px-2.5 rounded-xl border border-amber-500/20">
                            <span className="text-amber-400 flex items-center gap-1.5 font-black text-xs">
                                <Coins size={14} aria-hidden="true" /> Recompensa de Caza
                            </span>
                            <span className="font-black text-amber-300 font-mono text-sm tabular-nums">
                                +{article.boss_kc_reward} KC
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Drops Table */}
            {article.boss_drops && article.boss_drops.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="font-black text-[11px] uppercase tracking-wider text-(--accent)">
                        Tabla de Botín / Drops
                    </div>
                    <div className="space-y-1">
                        {article.boss_drops.map((drop, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
                                <span className="text-white/80 font-medium">{drop.split('(')[0].trim()}</span>
                                <span className="px-2 py-0.5 rounded-md bg-[#168c80]/20 text-(--accent) font-mono text-[10px] font-bold border border-[#89d9d1]/20 tabular-nums">
                                    {drop.includes('(') ? `(${drop.split('(')[1]}` : '100%'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    )
}
