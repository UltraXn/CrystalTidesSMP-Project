import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ReactMarkdown from 'react-markdown';
import { Shield, Zap, MapPin, Award, Maximize2, Coins, Compass, Swords, Flame, ShieldAlert, RotateCcw, Heart, Smile, Store, ShoppingBag, AlertTriangle, Sparkles } from 'lucide-react';

export interface BossAttack {
    name: string;
    type: string;
    damage: string;
    description: string;
    animation_clip?: string;
    variant_clips?: string[];
}

export interface BossPhaseData {
    phase_number: number;
    phase_name: string;
    model_3d_url?: string;
    hp?: string;
    damage?: string;
    attacks?: BossAttack[];
    transition_clip?: string;
}

export interface WikiBoss3DCardProps {
    minimal3dOnly?: boolean;
    activeClipOverride?: string;
    modelPath?: string;
    modelPathPhase2?: string;
    bossName?: string;
    category?: string;
    subtitle?: string;
    hp?: string;
    hpPhase2?: string;
    damage?: string;
    damagePhase2?: string;
    armor?: string;
    speed?: string;
    location?: string;
    spawnMethod?: string;
    description?: string;
    drops?: string[];
    kcReward?: number;
    phases?: BossPhaseData[];
    phase1Attacks?: BossAttack[];
    phase2Attacks?: BossAttack[];
    
    // Dynamic Labels & Theme from DB
    cardTheme?: 'red' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'slate';
    threatLabel?: string;
    hpLabel?: string;
    damageLabel?: string;
    speedLabel?: string;
    locationLabel?: string;
    dropsLabel?: string;
    bountyLabel?: string;
}

// Exact Skills extracted from MythicMobs toro_wither.yml & toro_wither_skill.yml
export const PHASE_1_ATTACKS: BossAttack[] = [
    {
        name: 'Wither Skull Cannon',
        type: 'Proyectil',
        damage: '25 Daño Abisal',
        description: 'Dispara proyectiles con modelo 3D de cráneo abisal guiado que aplican el efecto Wither.'
    },
    {
        name: 'Roundhouse Smash',
        type: 'AoE',
        damage: '20 Daño de Impacto',
        description: 'Ejecuta un giro giratorio concéntrico que empuja violentamente a todos los jugadores cercanos.'
    },
    {
        name: 'Abyssal Claw Swipe',
        type: 'Melee',
        damage: '35 Daño Físico',
        description: 'Zarpazo frontal descendente con garras de netherita corrompida que atraviesa escudos.'
    },
    {
        name: 'Wither Acid Pool',
        type: 'AoE',
        damage: '10/s Ácido',
        description: 'Invoca charcos de podredumbre oscura en el suelo que dañan de forma continua a los jugadores.'
    }
];

export const PHASE_2_ATTACKS: BossAttack[] = [
    {
        name: 'Projectile Resistance 90%',
        type: 'Defensa',
        damage: 'Pasiva de Coraza',
        description: 'Obtiene resistencia del 90% contra proyectiles y flechas (DamageModifier PROJECTILE 0.1).'
    },
    {
        name: 'Terror Frenzy Attack',
        type: 'Melee',
        damage: '50 Daño Crítico',
        description: 'Ataque cuerpo a cuerpo acelerado sin intervalo de invulnerabilidad (NoDamageTicks 1).'
    },
    {
        name: 'Darkness Sky Channeling',
        type: 'Canalizado',
        damage: 'Efecto Ceguera',
        description: 'Oscurece completamente los cielos del mundo (DarkenSky) y aumenta la frecuencia de sus ataques.',
        animation_clip: 'head_off'
    },
    {
        name: 'Terror Head Detonation',
        type: 'Proyectil',
        damage: '45 Daño Explosivo',
        description: 'Cercena y desprende sus cráneos voladores que rastrean autónomamente a los jugadores y explotan al impacto.',
        animation_clip: 'head_off_swing_shoot'
    }
];

const ATTACK_ANIMATION_MAP: Record<string, string[]> = {
    'wither skull cannon': ['shoot', 'idle'],
    'roundhouse smash': ['roundhouse', 'overhead_swipe', 'idle'],
    'abyssal claw swipe': ['overhead_swipe', 'claw1', 'claw2', 'idle'],
    'wither acid pool': ['wither_pool', 'idle'],
    'projectile resistance 90%': ['idle', 'head_off_idle'],
    'terror head detonation': ['head_off_swing_shoot', 'shoot', 'head_off_idle'],
    'darkness sky channeling': ['head_off', 'spawn', 'idle'],
    'terror frenzy attack': ['left_smash2', 'right_smash2', 'left_smash', 'left_swing']
};

function setupMeshPixelArt(child: THREE.Object3D, fallbackTex?: THREE.Texture): void {
    if (!(child instanceof THREE.Mesh)) return;
    const name = (child.name || '').toLowerCase();
    const isHitbox = name.includes('hitbox') || name.includes('collider') || name.includes('bounding');

    if (isHitbox) {
        child.visible = false;
        return;
    }

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
        if (!mat.map && fallbackTex) {
            mat.map = fallbackTex;
        }
        if (mat.map) {
            mat.map.magFilter = THREE.NearestFilter;
            mat.map.minFilter = THREE.NearestFilter;
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.needsUpdate = true;
        } else if ('color' in mat) {
            (mat as THREE.MeshStandardMaterial).color = new THREE.Color(0xd1d5db);
        }
        mat.needsUpdate = true;
        mat.side = THREE.DoubleSide;
    }
}

async function loadBakedHeadOffClip(): Promise<THREE.AnimationClip | null> {
    try {
        const res = await fetch('/models/head_off_baked_60fps.json');
        if (!res.ok) return null;
        const bakedData = await res.json();
        const times = new Float32Array(bakedData.times);
        const tracks: THREE.KeyframeTrack[] = [];

        for (const boneName in bakedData.tracks) {
            const trackData = bakedData.tracks[boneName];
            if (trackData.quaternions && trackData.quaternions.length > 0) {
                const quatArray = new Float32Array(trackData.quaternions);
                tracks.push(new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, quatArray));
            }
        }
        return new THREE.AnimationClip('head_off', bakedData.duration, tracks);
    } catch (err) {
        console.warn('Failed to load baked head_off animation:', err);
        return null;
    }
}

const getAttackClip = (attack: BossAttack, clips: THREE.AnimationClip[]) => {
    if (attack.animation_clip) {
        const target = attack.animation_clip.toLowerCase();
        const exact = clips.find((c) => c.name.toLowerCase() === target);
        if (exact) return exact;
        const fuzzy = clips.find((c) => c.name.toLowerCase().includes(target));
        if (fuzzy) return fuzzy;
    }
    const attackKey = attack.name.toLowerCase();
    const candidateNames = ATTACK_ANIMATION_MAP[attackKey] || [attackKey, 'attack', 'idle'];
    for (const candidate of candidateNames) {
        const candLower = candidate.toLowerCase();
        if (candLower === 'idle' || candLower === 'head_off_idle') continue;
        
        const exact = clips.find((c) => c.name.toLowerCase() === candLower);
        if (exact) return exact;

        const fuzzy = clips.find((c) => c.name.toLowerCase().includes(candLower));
        if (fuzzy) return fuzzy;
    }
    return undefined;
};

export const WikiBoss3DCard: React.FC<WikiBoss3DCardProps> = ({
    minimal3dOnly = false,
    activeClipOverride,
    modelPath = '/models/toro_wither.gltf',
    modelPathPhase2,
    bossName = 'Entidad',
    category = '',
    subtitle = 'Bestiario • Entidad Modificada',
    hp = '100 HP',
    hpPhase2,
    damage = 'Ataque Estándar',
    damagePhase2,
    armor = 'Sin Armadura',
    speed = 'Velocidad Normal',
    location = 'Overworld / Estructura',
    spawnMethod = 'Generación Natural',
    description = '',
    drops = [],
    kcReward = 0,
    phases = [],
    phase1Attacks,
    phase2Attacks,
    cardTheme,
    threatLabel,
    hpLabel,
    damageLabel,
    speedLabel,
    locationLabel,
    dropsLabel,
    bountyLabel,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardWrapperRef = useRef<HTMLDivElement>(null);

    const activePhases: BossPhaseData[] = (phases && phases.length > 0)
        ? phases
        : (hpPhase2 || modelPathPhase2 || (phase2Attacks && phase2Attacks.length > 0))
            ? [
                { phase_number: 1, phase_name: 'Fase I: Combate', model_3d_url: modelPath, hp, damage, attacks: phase1Attacks || PHASE_1_ATTACKS },
                { phase_number: 2, phase_name: 'Fase II: Despertar', model_3d_url: modelPathPhase2 || modelPath, hp: hpPhase2, damage: damagePhase2, attacks: phase2Attacks || PHASE_2_ATTACKS }
            ]
            : [
                { phase_number: 1, phase_name: 'Estadísticas & Combate', model_3d_url: modelPath, hp, damage, attacks: phase1Attacks || PHASE_1_ATTACKS }
            ];

    const [selectedPhase, setSelectedPhase] = useState<number>(1);
    const currentPhaseObj = activePhases.find(p => p.phase_number === selectedPhase) || activePhases[0];

    const [activeModel, setActiveModel] = useState<string>(currentPhaseObj.model_3d_url || modelPath);
    const activeAttacksList = currentPhaseObj.attacks || [];
    const [selectedAttack, setSelectedAttack] = useState<BossAttack | null>(activeAttacksList[0] || null);
    const [attackTriggerCount, setAttackTriggerCount] = useState<number>(0);
    const [playingVariantClip, setPlayingVariantClip] = useState<string | null>(null);
    const selectedAttackRef = useRef<BossAttack | null>(selectedAttack);
    const isDecapitatedRef = useRef<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isDraggingRef = useRef<boolean>(false);
    const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: Math.PI });

    const activeMixerRef = useRef<THREE.AnimationMixer | null>(null);
    const activeClipsRef = useRef<THREE.AnimationClip[]>([]);
    const currentActionRef = useRef<THREE.AnimationAction | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const pool1Ref = useRef<THREE.Object3D | null>(null);
    const pool2Ref = useRef<THREE.Object3D | null>(null);
    const pool1OpacityRef = useRef<number>(0);
    const pool1TargetOpacityRef = useRef<number>(0);
    const pool2OpacityRef = useRef<number>(0);
    const pool2TargetOpacityRef = useRef<number>(0);
    const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const setHeadVisibility = useCallback((decapitated: boolean) => {
        if (!modelRef.current) return;
        modelRef.current.traverse((child) => {
            const childName = child.name.toLowerCase();
            if (childName.includes('head_on_hand')) {
                child.visible = decapitated;
            } else if (childName === 'h_head') {
                child.visible = !decapitated;
            }
        });
    }, []);

    const switchPhase = (phaseNum: number) => {
        setSelectedPhase(phaseNum);
        setAttackTriggerCount(0);
        isDecapitatedRef.current = false;
        setHeadVisibility(false);
        pendingTimersRef.current.forEach(t => clearTimeout(t));
        pendingTimersRef.current = [];
        const targetPhase = activePhases.find(p => p.phase_number === phaseNum) || activePhases[0];
        if (targetPhase?.model_3d_url) {
            setActiveModel(targetPhase.model_3d_url);
        }
        if (targetPhase?.attacks && targetPhase.attacks.length > 0) {
            setSelectedAttack(targetPhase.attacks[0]);
            selectedAttackRef.current = targetPhase.attacks[0];
        }
    };

    useEffect(() => {
        if (modelPath && modelPath !== activeModel) {
            setActiveModel(modelPath);
        }
    }, [modelPath]);

    useEffect(() => {
        if (activeClipOverride) {
            triggerVariantClip(activeClipOverride);
        }
    }, [activeClipOverride]);

    const triggerAttack = (attack: BossAttack) => {
        setSelectedAttack(attack);
        selectedAttackRef.current = attack;
        setPlayingVariantClip(null);
        setAttackTriggerCount((prev) => prev + 1);
    };

    const triggerVariantClip = (clipName: string) => {
        if (!selectedAttack) return;
        const variantAttack: BossAttack = { ...selectedAttack, animation_clip: clipName };
        selectedAttackRef.current = variantAttack;
        setPlayingVariantClip(clipName);
        setAttackTriggerCount((prev) => prev + 1);
    };

    useEffect(() => {
        if (!activeMixerRef.current || !activeClipsRef.current.length || attackTriggerCount === 0) return;

        const attack = selectedAttackRef.current;
        if (!attack) return;
        const attackKey = attack.name.toLowerCase();
        const clipName = (attack.animation_clip || '').toLowerCase();
        const isDecapitationTransition = attackKey.includes('darkness sky') || attackKey.includes('decapita') || clipName === 'head_off';
        const isPhase2 = selectedPhase > 1 || (currentPhaseObj && currentPhaseObj.phase_number > 1) || activeModel.includes('terror');
        const isPoolAttack = attackKey.includes('pool') || attackKey.includes('acid');

        pendingTimersRef.current.forEach(t => clearTimeout(t));
        pendingTimersRef.current = [];

        if (isPoolAttack) {
            pool1TargetOpacityRef.current = 0.0;
            pool2TargetOpacityRef.current = 0.0;
            const pt1 = setTimeout(() => { pool1TargetOpacityRef.current = 1.0; }, 2950);
            const pt2 = setTimeout(() => { pool2TargetOpacityRef.current = 1.0; }, 4350);
            pendingTimersRef.current.push(pt1, pt2);
        } else {
            pool1TargetOpacityRef.current = 0.0;
            pool2TargetOpacityRef.current = 0.0;
        }

        const mixer = activeMixerRef.current;
        const clips = activeClipsRef.current;
        const normalIdleClip = clips.find((c) => c.name.toLowerCase() === 'idle') || clips[0];
        const headOffIdleClip = clips.find((c) => c.name.toLowerCase() === 'head_off_idle') || normalIdleClip;
        const attackClip = getAttackClip(attack, clips);

        const targetIdle = (isPhase2 && (isDecapitatedRef.current || isDecapitationTransition)) ? headOffIdleClip : normalIdleClip;

        const playClip = (clipToPlay: THREE.AnimationClip, loop: boolean, onFinishedCallback?: () => void) => {
            const newAction = mixer.clipAction(clipToPlay);
            const prevAction = currentActionRef.current;

            if (prevAction && prevAction !== newAction) {
                prevAction.fadeOut(0.25);
            }

            newAction.reset();
            newAction.enabled = true;
            newAction.setEffectiveTimeScale(1);
            newAction.setEffectiveWeight(1);
            newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
            newAction.clampWhenFinished = !loop;
            newAction.fadeIn(0.25);
            newAction.play();
            currentActionRef.current = newAction;

            if (!loop && onFinishedCallback) {
                let callbackExecuted = false;
                const safeFinish = () => {
                    if (callbackExecuted) return;
                    callbackExecuted = true;
                    mixer.removeEventListener('finished', handleFinished);
                    onFinishedCallback();
                };

                const handleFinished = (e: THREE.Event & { action?: THREE.AnimationAction }) => {
                    if (e.action === newAction) {
                        safeFinish();
                    }
                };
                mixer.addEventListener('finished', handleFinished);

                const fallback = setTimeout(() => {
                    safeFinish();
                }, (clipToPlay.duration * 1000) + 100);
                pendingTimersRef.current.push(fallback);
            }
        };

        if (isDecapitationTransition) {
            setHeadVisibility(false);

            if (attackClip) {
                playClip(attackClip, false, () => {
                    isDecapitatedRef.current = true;
                    setHeadVisibility(true);
                    playClip(headOffIdleClip, true);
                });
            } else {
                isDecapitatedRef.current = true;
                setHeadVisibility(true);
                playClip(headOffIdleClip, true);
            }
        } else if (attackClip && attackClip !== targetIdle) {
            playClip(attackClip, false, () => {
                if (isPhase2 && isDecapitatedRef.current) setHeadVisibility(true);
                playClip(targetIdle, true);
            });
        } else {
            playClip(targetIdle, true);
        }

        return () => {
            pendingTimersRef.current.forEach(t => clearTimeout(t));
            pendingTimersRef.current = [];
        };
    }, [attackTriggerCount]);

    useEffect(() => {
        let isSubscribed = true;
        const container = containerRef.current;
        if (!container) return;

        setIsLoading(true);

        const scene = new THREE.Scene();
        const width = container.clientWidth || 360;
        const height = container.clientHeight || 400;

        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
        camera.position.set(0, 0, 3.8);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const newWidth = container.clientWidth || window.innerWidth;
            const newHeight = container.clientHeight || window.innerHeight;
            if (newWidth > 0 && newHeight > 0) {
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            }
        };

        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(container);

        document.addEventListener('fullscreenchange', handleResize);
        window.addEventListener('resize', handleResize);

        while (container.firstChild) {
            container.firstChild.remove();
        }
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
        scene.add(ambientLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 2.2);
        topLight.position.set(3, 5, 4);
        scene.add(topLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
        fillLight.position.set(-3, -2, -4);
        scene.add(fillLight);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        const texturePath = activeModel.replace('.gltf', '.png');
        const fallbackTex = new THREE.TextureLoader().load(texturePath);
        fallbackTex.magFilter = THREE.NearestFilter;
        fallbackTex.minFilter = THREE.NearestFilter;
        fallbackTex.colorSpace = THREE.SRGBColorSpace;

        const loader = new GLTFLoader();

        const isWitherModel = activeModel.toLowerCase().includes('wither') || activeModel.toLowerCase().includes('forgotten') || activeModel.toLowerCase().includes('terror');

        if (isWitherModel) {
            const poolTex = new THREE.TextureLoader().load('/models/toro_wither_pool.png');
            poolTex.magFilter = THREE.NearestFilter;
            poolTex.minFilter = THREE.NearestFilter;
            poolTex.colorSpace = THREE.SRGBColorSpace;

            loader.load(
                '/models/toro_wither_pool.gltf',
                (poolGltf) => {
                    if (!isSubscribed) return;

                    const pool1 = poolGltf.scene;
                    const pool2 = poolGltf.scene.clone(true);

                    pool1Ref.current = pool1;
                    pool2Ref.current = pool2;

                    pool1.traverse((child) => {
                        setupMeshPixelArt(child, poolTex);
                        if (child instanceof THREE.Mesh) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const mat of mats) {
                                mat.transparent = true;
                                mat.opacity = pool1OpacityRef.current;
                            }
                        }
                    });

                    pool2.traverse((child) => {
                        setupMeshPixelArt(child, poolTex);
                        if (child instanceof THREE.Mesh) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const mat of mats) {
                                mat.transparent = true;
                                mat.opacity = pool2OpacityRef.current;
                            }
                        }
                    });

                    pool1.scale.setScalar(0.22);
                    pool1.position.set(-0.18, -1.05, 0.0);
                    pool1.visible = pool1OpacityRef.current > 0.01;

                    pool2.scale.setScalar(0.22);
                    pool2.position.set(0.18, -1.05, 0.0);
                    pool2.visible = pool2OpacityRef.current > 0.01;

                    const poolGroup = new THREE.Group();
                    poolGroup.add(pool1);
                    poolGroup.add(pool2);
                    mainGroup.add(poolGroup);
                },
                undefined,
                (err) => console.warn('Acid pool model load warning:', err)
            );
        }

        const loadModelWithFallback = (targetUrl: string) => {
            loader.load(
                targetUrl,
                (gltf) => {
                    if (!isSubscribed) return;

                    const model = gltf.scene;
                    modelRef.current = model;

                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    
                    const isSkull = targetUrl.toLowerCase().includes('skull');
                    const isTerror = targetUrl.includes('terror');
                    let targetSize = 1.75;
                    if (isSkull) {
                        targetSize = 1.0;
                    } else if (!isTerror) {
                        targetSize = 2.2;
                    }

                    const scale = maxDim > 0 ? targetSize / maxDim : 1;

                    model.traverse((child) => {
                        setupMeshPixelArt(child, fallbackTex);
                        const childName = child.name.toLowerCase();

                        if (childName.includes('head_on_hand')) {
                            child.visible = isDecapitatedRef.current;
                        } else if (childName === 'h_head') {
                            child.visible = !isDecapitatedRef.current;
                        }
                    });

                    model.scale.setScalar(scale);
                    model.position.sub(center.multiplyScalar(scale));
                    
                    if (!isSkull) {
                        model.position.y -= (isTerror ? 0.1 : 0.25);
                    }

                    mainGroup.add(model);

                    if (gltf.animations && gltf.animations.length > 0) {
                        loadBakedHeadOffClip().then((bakedClip) => {
                            if (!isSubscribed) return;
                            if (bakedClip) {
                                const headOffIndex = gltf.animations.findIndex((c) => c.name.toLowerCase() === 'head_off');
                                if (headOffIndex !== -1) {
                                    gltf.animations[headOffIndex] = bakedClip;
                                } else {
                                    gltf.animations.push(bakedClip);
                                }
                            }

                            gltf.animations.forEach((clip) => {
                                clip.tracks.forEach((track) => {
                                    track.setInterpolation(THREE.InterpolateLinear);
                                });
                            });

                            const mixer = new THREE.AnimationMixer(model);
                            activeMixerRef.current = mixer;
                            activeClipsRef.current = gltf.animations;

                            const defaultIdleClip = gltf.animations.find((c) => c.name.toLowerCase() === 'idle')
                                                 || gltf.animations.find((c) => c.name.toLowerCase() === 'head_off_idle')
                                                 || gltf.animations[0];

                            const action = mixer.clipAction(defaultIdleClip);
                            action.reset();
                            action.setLoop(THREE.LoopRepeat, Infinity);
                            action.play();
                            currentActionRef.current = action;
                            setIsLoading(false);
                        });
                    } else {
                        setIsLoading(false);
                    }
                },
                undefined,
                (error) => {
                    console.warn(`3D Model load failed for ${targetUrl}:`, error);
                    if (isSubscribed) {
                        const holoGeo = new THREE.OctahedronGeometry(1.0, 0);
                        const holoMat = new THREE.MeshStandardMaterial({
                            color: 0xef4444,
                            wireframe: true,
                            emissive: 0x991b1b,
                            emissiveIntensity: 0.8
                        });
                        const holoMesh = new THREE.Mesh(holoGeo, holoMat);
                        holoMesh.position.set(0, 0, 0);
                        mainGroup.add(holoMesh);
                        modelRef.current = holoMesh;
                        setIsLoading(false);
                    }
                }
            );
        };

        loadModelWithFallback(activeModel);

        const clock = new THREE.Clock();
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            if (activeMixerRef.current) {
                activeMixerRef.current.update(delta);

                if (currentActionRef.current) {
                    const action = currentActionRef.current;
                    const clipName = action.getClip().name.toLowerCase();
                    if (clipName === 'head_off') {
                        const isDecap = (action.time >= 4.7) || isDecapitatedRef.current;
                        setHeadVisibility(isDecap);
                    } else if (clipName.includes('head_off')) {
                        setHeadVisibility(true);
                    } else {
                        setHeadVisibility(false);
                    }
                }
            }

            if (pool1Ref.current) {
                const curOp1 = pool1OpacityRef.current;
                const tgtOp1 = pool1TargetOpacityRef.current;
                if (Math.abs(curOp1 - tgtOp1) > 0.005) {
                    const nextOp1 = curOp1 + (tgtOp1 - curOp1) * 0.08;
                    pool1OpacityRef.current = nextOp1;
                    pool1Ref.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const mat of mats) {
                                mat.transparent = true;
                                mat.opacity = nextOp1;
                            }
                        }
                    });
                    pool1Ref.current.visible = nextOp1 > 0.005;
                }
            }

            if (pool2Ref.current) {
                const curOp2 = pool2OpacityRef.current;
                const tgtOp2 = pool2TargetOpacityRef.current;
                if (Math.abs(curOp2 - tgtOp2) > 0.005) {
                    const nextOp2 = curOp2 + (tgtOp2 - curOp2) * 0.08;
                    pool2OpacityRef.current = nextOp2;
                    pool2Ref.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const mat of mats) {
                                mat.transparent = true;
                                mat.opacity = nextOp2;
                            }
                        }
                    });
                    pool2Ref.current.visible = nextOp2 > 0.005;
                }
            }

            mainGroup.rotation.y += (targetRotationRef.current.y - mainGroup.rotation.y) * 0.1;
            mainGroup.rotation.x += (targetRotationRef.current.x - mainGroup.rotation.x) * 0.1;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            isSubscribed = false;
            resizeObserver.disconnect();
            document.removeEventListener('fullscreenchange', handleResize);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
        };
    }, [activeModel]);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x += deltaY * 0.01;

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const resetView = () => {
        targetRotationRef.current = { x: 0, y: Math.PI };
    };

    const toggleFullscreen = () => {
        const elem = containerRef.current?.parentElement || cardWrapperRef.current;
        if (!elem) return;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    if (minimal3dOnly) {
        return (
            <div ref={cardWrapperRef} className="w-full h-full min-h-[360px] relative rounded-xl border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                <div
                    tabIndex={0}
                    role="region"
                    aria-label="Visualizador 3D interactivo"
                    className="w-full h-full absolute inset-0 bg-radial from-slate-900/40 via-black to-black flex items-center justify-center cursor-grab active:cursor-grabbing text-left p-0 border-0 outline-none font-normal appearance-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-20">
                            <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-2" />
                            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">Cargando 3D...</span>
                        </div>
                    )}

                    <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        <button type="button"
                            onClick={(e) => { e.stopPropagation(); resetView(); }}
                            className="p-1.5 rounded-lg bg-black/60 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                            title="Reiniciar Cámara 360°"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="p-1.5 rounded-lg bg-black/60 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                            title="Pantalla Completa 3D"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                        <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">Arrastra para rotar 360°</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full my-1">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/90 shadow-xl backdrop-blur-xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">

                    <div
                        tabIndex={0}
                        role="region"
                        aria-label="Visualizador 3D interactivo"
                        className="lg:col-span-5 relative w-full h-full min-h-95 bg-radial from-slate-900/40 via-black to-black flex items-center justify-center cursor-grab active:cursor-grabbing border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden text-left p-0 border-0 outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 font-normal appearance-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowLeft') targetRotationRef.current.y -= 0.1;
                            if (e.key === 'ArrowRight') targetRotationRef.current.y += 0.1;
                        }}
                    >
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-20">
                                <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-2" />
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">Cargando 3D...</span>
                            </div>
                        )}

                        <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

                        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[80%]">
                            {activePhases.map((phase) => (
                                <button type="button"
                                    key={`phase-tab-${phase.phase_number}`}
                                    onClick={(e) => { e.stopPropagation(); switchPhase(phase.phase_number); }}
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                                        selectedPhase === phase.phase_number
                                            ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-lg shadow-red-500/10'
                                            : 'bg-black/60 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Flame className="w-3 h-3" /> {phase.phase_name || `Fase ${phase.phase_number}`} {phase.hp ? `(${phase.hp})` : ''}
                                </button>
                            ))}
                        </div>

                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                            <button type="button"
                                onClick={(e) => { e.stopPropagation(); resetView(); }}
                                className="p-1.5 rounded-lg bg-black/60 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                                title="Reiniciar Cámara 360°"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button type="button"
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="p-1.5 rounded-lg bg-black/60 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                                title="Pantalla Completa 3D"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                            <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">Arrastra para rotar 360°</span>
                        </div>
                    </div>

                    <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                        <div>
                            {(() => {
                                const subLower = (subtitle || '').toLowerCase();
                                const catLower = (category || '').toLowerCase();

                                const isTameable = cardTheme === 'emerald' || (!cardTheme && (catLower.includes('critters') || subLower.includes('domésticable') || subLower.includes('domesticable') || subLower.includes('companero') || subLower.includes('compañero') || subLower.includes('mascota') || subLower.includes('fauna')));
                                const isMerchant = cardTheme === 'amber' || (!cardTheme && (catLower.includes('ribbit') || subLower.includes('comerciante') || subLower.includes('mercader') || subLower.includes('tienda') || subLower.includes('vendedor')));
                                const isBoss = cardTheme === 'purple' || (!cardTheme && ((activePhases && activePhases.length > 1) || catLower.includes('qliphoth') || catLower.includes('boss') || subLower.includes('jefe') || subLower.includes('boss')));
                                const isHostile = cardTheme === 'red' || (!isTameable && !isMerchant && !isBoss);

                                if (isTameable) {
                                    return (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-1.5">
                                            <Heart className="w-3 h-3" /> Critters & Companions • {subtitle || 'Fauna Domésticable'}
                                        </div>
                                    );
                                }
                                if (isMerchant) {
                                    return (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest mb-1.5">
                                            <ShoppingBag className="w-3 h-3" /> Ribbits & Traders • {subtitle || 'Mercader Ambulante'}
                                        </div>
                                    );
                                }
                                if (isHostile) {
                                    return (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest mb-1.5">
                                            <AlertTriangle className="w-3 h-3" /> Mobs of Mythology • {subtitle || 'Criatura Hostil'}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-widest mb-1.5">
                                        <Flame className="w-3 h-3" /> MythicMobs • {subtitle || 'Jefe Imperial'}
                                    </div>
                                );
                            })()}

                            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                                {bossName} {currentPhaseObj.phase_name ? `• ${currentPhaseObj.phase_name}` : ''}
                            </h2>

                            {description && (
                                <div className="text-[11px] text-gray-300 leading-relaxed font-medium mb-3 space-y-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:text-white [&_p]:mb-1">
                                    <ReactMarkdown>{description.replace(/\\n/g, '\n')}</ReactMarkdown>
                                </div>
                            )}

                            {(() => {
                                const subLower = (subtitle || '').toLowerCase();
                                const catLower = (category || '').toLowerCase();

                                const isTameable = catLower.includes('critters') || subLower.includes('domésticable') || subLower.includes('domesticable') || subLower.includes('companero') || subLower.includes('compañero') || subLower.includes('mascota') || subLower.includes('fauna');
                                const isMerchant = catLower.includes('ribbit') || subLower.includes('comerciante') || subLower.includes('mercader') || subLower.includes('tienda') || subLower.includes('vendedor');
                                const isBoss = (activePhases && activePhases.length > 1) || catLower.includes('qliphoth') || catLower.includes('boss') || subLower.includes('jefe') || subLower.includes('boss');
                                const isHostile = !isTameable && !isMerchant && !isBoss;

                                if (isTameable) {
                                    return (
                                        <div className="space-y-3 mb-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                        <Heart className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{threatLabel || 'Domesticación'}</div>
                                                        <div className="text-[11px] font-bold text-emerald-300">
                                                            {drops && drops.length > 0 ? drops.slice(0, 2).join(', ') : 'Comida Especial'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                                                        <Smile className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{damageLabel || 'Temperamento'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            Pasivo & Dócil (Mascota)
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                                                        <Shield className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{hpLabel || 'Salud de Compañero'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {hp}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                                                        <Compass className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{speedLabel || 'Marcha & Agilidad'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {speed}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                                    <Sparkles size={12} /> Características de Acompañante
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                    <strong className="text-white">Domesticable:</strong> Al alimentarlo con su comida favorita, este compañero te seguirá fielmente en tus aventuras por CrystalTides.
                                                </p>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                                    <MapPin size={12} /> {locationLabel || 'Hábitat Natural'}
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                    <strong className="text-white">Ubicación:</strong> {location}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (isMerchant) {
                                    return (
                                        <div className="space-y-3 mb-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                                        <Coins className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{threatLabel || 'Moneda de Cambio'}</div>
                                                        <div className="text-[11px] font-bold text-amber-300">
                                                            KilluCoins (KC) / Esmeraldas
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                                        <Store className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{damageLabel || 'Especialidad de Tienda'}</div>
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
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{hpLabel || 'Resistencia NPC'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {hp} (Protegido por Aldea)
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                        <Compass className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{speedLabel || 'Frecuencia'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            Encuentro de Campo
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                                                        <ShoppingBag size={13} /> {dropsLabel || 'Catálogo de Mercado Offered'}
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 font-mono">Intercambio de Comercio</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {drops && drops.length > 0 ? (
                                                        drops.map((item) => (
                                                            <span key={item} className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200 text-[10px] font-bold flex items-center gap-1">
                                                                🪙 {item}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">Ofertas especiales disponibles al interactuar en el juego.</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                                    <MapPin size={12} /> {locationLabel || 'Ubicación de Encuentro'}
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                    <strong className="text-white">Ubicación:</strong> {location}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (isHostile) {
                                    return (
                                        <div className="space-y-3 mb-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{threatLabel || 'Nivel de Amenaza'}</div>
                                                        <div className="text-[11px] font-bold text-orange-300">
                                                            Hostil (Depredador)
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                                                        <Shield className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{hpLabel || 'Salud de Combate'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {hp}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                                        <Zap className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{damageLabel || 'Poder de Daño'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {damage}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                                                        <Compass className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{speedLabel || 'Velocidad'}</div>
                                                        <div className="text-[11px] font-bold text-white">
                                                            {speed}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                                    <MapPin size={12} /> {locationLabel || 'Ubicación & Aparición'}
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                    <strong className="text-white">Hábitat:</strong> {location}
                                                </p>
                                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                    <strong className="text-white">Aparición:</strong> {spawnMethod}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <Award className="w-3.5 h-3.5 text-amber-400" /> {dropsLabel || 'Botín de Caza'}
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {drops.map((drop) => (
                                                        <span
                                                            key={drop}
                                                            className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[10px] font-semibold flex items-center gap-1.5"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                            {drop}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3 mb-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                                                    <Shield className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{hpLabel || 'Salud de Fase'}</div>
                                                    <div className="text-[11px] font-bold text-white">
                                                        {currentPhaseObj.hp || hp}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                                    <Zap className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{damageLabel || 'Ataque & Daño'}</div>
                                                    <div className="text-[11px] font-bold text-white">
                                                        {currentPhaseObj.damage || damage}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{threatLabel || 'Resistencia / Escudo'}</div>
                                                    <div className="text-[11px] font-bold text-white">
                                                        {selectedPhase === 1 ? armor : '90% Reducción Proyectiles'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                                                    <Compass className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase font-mono tracking-wider">{speedLabel || 'Velocidad / Rango'}</div>
                                                    <div className="text-[11px] font-bold text-white">
                                                        {speed}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                                                    <Swords size={13} /> Habilidades MythicMobs • Fase {selectedPhase}
                                                </div>
                                                <span className="text-[9px] text-gray-400 font-mono">Prueba una habilidad en 3D</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {activeAttacksList.map((attack) => (
                                                    <button
                                                        key={attack.name}
                                                        type="button"
                                                        onClick={() => triggerAttack(attack)}
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                                            selectedAttack?.name === attack.name
                                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                                                                : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                                                        }`}
                                                    >
                                                        ⚔️ {attack.name}
                                                    </button>
                                                ))}
                                            </div>

                                            {selectedAttack && (
                                                <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 mt-2 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-white">{selectedAttack.name}</span>
                                                        <div className="flex gap-1.5">
                                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase">
                                                                {selectedAttack.type}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400">
                                                                {selectedAttack.damage}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-300 leading-normal">
                                                        {selectedAttack.description}
                                                    </p>
                                                    {selectedAttack.variant_clips && selectedAttack.variant_clips.length > 0 && (
                                                        <div className="pt-2 border-t border-white/10 mt-2">
                                                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Animaciones de Variante 3D:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {selectedAttack.variant_clips.map((clip) => (
                                                                    <button
                                                                        key={clip}
                                                                        type="button"
                                                                        onClick={() => triggerVariantClip(clip)}
                                                                        className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                                                                            playingVariantClip === clip
                                                                                ? 'bg-amber-500/30 text-amber-200 border-amber-500/60'
                                                                                : 'bg-black/50 text-gray-300 border-white/10 hover:border-white/20'
                                                                        }`}
                                                                    >
                                                                        ▶ {clip}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                                <MapPin size={12} /> Ubicación & Ritual de Invocación
                                            </div>
                                            <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                <strong className="text-white">Hábitat:</strong> {location}
                                            </p>
                                            <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                                <strong className="text-white">Ritual:</strong> {spawnMethod}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Award className="w-3.5 h-3.5 text-amber-400" /> Botín & Drops Míticos
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {drops.map((drop) => (
                                                    <span
                                                        key={drop}
                                                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[10px] font-semibold flex items-center gap-1.5"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                        {drop}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                                <Coins size={14} />
                                <span>{bountyLabel || 'Recompensa de Caza'}</span>
                            </div>
                            <span className="font-mono text-base font-black text-amber-300">
                                +{kcReward.toLocaleString()} KC
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WikiBoss3DCard;
