import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createSoftGlowParticleTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.35)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const staffColorPalettes: { [key: string]: { primary: string; secondary: string } } = {
    "KillubysmaliVT": { primary: "#00637c", secondary: "#5eead4" },
    "Neroferno ultranix": { primary: "#ff00b7", secondary: "#e879f9" },
    "Xurlito": { primary: "#00aeef", secondary: "#38bdf8" },
    "JAPA325": { primary: "#1d4ed8", secondary: "#60a5fa" }
};

const EMPTY_MEMBERS: string[] = [];

interface Minecraft3DAltarCanvasProps {
    stageId: number;
    accentColor?: string;
    activeStaffColor?: string | null;
    linkedMembersList?: string[];
    dragActiveMember?: string | null;
    cursorPos?: { x: number; y: number } | null;
}

export const Minecraft3DAltarCanvas: React.FC<Minecraft3DAltarCanvasProps> = ({ 
    stageId, 
    accentColor = '#89d9d1',
    activeStaffColor = null,
    linkedMembersList = EMPTY_MEMBERS,
    dragActiveMember = null,
    cursorPos = null
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeStaffColorRef = useRef<string | null>(activeStaffColor);
    const linkedMembersRef = useRef<string[]>(linkedMembersList);
    const dragActiveMemberRef = useRef<string | null>(dragActiveMember);
    const cursorPosRef = useRef<{ x: number; y: number } | null>(cursorPos);
    const prevLinkedMembersRef = useRef<string[]>([]);
    const flareTimerRef = useRef<number>(0);
    const flaringColorRef = useRef<string | null>(null);
    const hasExplodedRef = useRef<boolean>(false);
    const explosionTimerRef = useRef<number>(0);
    const explosionDelayTimerRef = useRef<number>(0.4);

    useEffect(() => {
        activeStaffColorRef.current = activeStaffColor;
    }, [activeStaffColor]);

    useEffect(() => {
        // Detect newly linked member to trigger color-matched 2.5s flare
        const prevList = prevLinkedMembersRef.current;
        if (linkedMembersList.length > prevList.length) {
            const prevSet = new Set(prevList);
            const newlyLinked = linkedMembersList.find(m => !prevSet.has(m));
            if (newlyLinked && staffColorPalettes[newlyLinked]) {
                flaringColorRef.current = staffColorPalettes[newlyLinked].primary;
                flareTimerRef.current = 2.5;
            }
        }
        prevLinkedMembersRef.current = linkedMembersList;
        linkedMembersRef.current = linkedMembersList;
    }, [linkedMembersList]);

    useEffect(() => {
        dragActiveMemberRef.current = dragActiveMember;
        cursorPosRef.current = cursorPos;
    }, [dragActiveMember, cursorPos]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isSubscribed = true;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 5.0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Lighting Setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const stageColor = new THREE.Color(accentColor);
        const pointLight1 = new THREE.PointLight(stageColor, 6, 15);
        pointLight1.position.set(3, 3, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff4444, 4, 15);
        pointLight2.position.set(-3, -3, 3);
        scene.add(pointLight2);

        // 3. Minecraft 3D Object Group
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        const textureLoader = new THREE.TextureLoader();
        let mixer: THREE.AnimationMixer | null = null;

        let activeBeamTexture: THREE.Texture | null = null;
        let activeBeamCoreMesh: THREE.Mesh | null = null;
        let activeBeamAuraMesh: THREE.Mesh | null = null;
        let activeBeaconCore: THREE.Mesh | null = null;
        let netherStarFrontGroup: THREE.Group | null = null;
        let fullStarMat: THREE.MeshBasicMaterial | null = null;
        const starShards: THREE.Mesh[] = [];
        const starShardMats: THREE.MeshBasicMaterial[] = [];

        let shockwaveMesh: THREE.Mesh | null = null;
        let expPoints: THREE.Points | null = null;
        const expSparkCount = 120;
        const expVelArr: THREE.Vector3[] = [];

        const staffRayNames = ["KillubysmaliVT", "Neroferno ultranix", "Xurlito", "JAPA325"];
        const staff3DRaysDict: { 
            [key: string]: { 
                coreMesh: THREE.Mesh; 
                coreMat: THREE.MeshBasicMaterial; 
                auraMesh: THREE.Mesh; 
                auraMat: THREE.MeshBasicMaterial; 
            } 
        } = {};

        if (stageId === 3) {
            // LOAD NATIVE FULL TORO WITHER GLTF MODEL EXPORTED FROM BLOCKBENCH (738 KB)
            const loader = new GLTFLoader();
            loader.load('/models/toro_wither.gltf', (gltf) => {
                if (!isSubscribed) return;

                const model = gltf.scene;

                // Traverse model: Hide untextured meshes (hitboxes/dummies/white boxes) & configure pixel-art texture filtering
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const name = (child.name || '').toLowerCase();
                        const isHitboxName = name.includes('hitbox') || name.includes('collider') || name.includes('bounding');

                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        const hasTextureMap = mats.some((m) => m && m.map);

                        if (isHitboxName || !hasTextureMap) {
                            child.visible = false;
                        } else {
                            child.visible = true;
                            mats.forEach((mat) => {
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

                // Calculate bounding box center and size
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const scale = 3.2 / maxDim;

                // Position model inside pivot group centered at origin (facing front)
                model.scale.set(scale, scale, scale);
                model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

                const witherPivot = new THREE.Group();
                witherPivot.add(model);
                witherPivot.rotation.y = Math.PI;
                mainGroup.add(witherPivot);

                // Play Idle Animation clip if available
                if (gltf.animations && gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    const idleClip = gltf.animations.find((clip) => clip.name.toLowerCase() === 'idle') || gltf.animations[0];
                    if (idleClip) {
                        const action = mixer.clipAction(idleClip);
                        action.play();
                    }
                }
            });
        } else if (stageId === 2) {
            // Group Beacon model objects and move them back along Z axis so electric rays render in front
            const beaconGroup = new THREE.Group();
            beaconGroup.position.set(0, 0, -1.2);
            mainGroup.add(beaconGroup);

            // 1. Outer Glass Box (1.4 x 1.4 x 1.4) using clean glass.png texture
            const glassTexture = textureLoader.load('/images/glass.png?v=2');
            glassTexture.magFilter = THREE.NearestFilter;
            glassTexture.minFilter = THREE.NearestFilter;

            const glassGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
            const glassMat = new THREE.MeshStandardMaterial({
                map: glassTexture,
                transparent: true,
                alphaTest: 0.05,
                roughness: 0.1,
                side: THREE.DoubleSide
            });
            const glassMesh = new THREE.Mesh(glassGeo, glassMat);
            glassMesh.position.set(0, 0, 0);
            beaconGroup.add(glassMesh);

            // 2. Obsidian Base Slab sitting inside bottom of glass box
            const obsTexture = textureLoader.load('/images/obsidian.png?v=2');
            obsTexture.magFilter = THREE.NearestFilter;
            obsTexture.minFilter = THREE.NearestFilter;
            obsTexture.wrapS = THREE.RepeatWrapping;
            obsTexture.wrapT = THREE.RepeatWrapping;
            obsTexture.repeat.set(1, 0.1875);
            obsTexture.offset.set(0, 0.8125);

            const obsGeo = new THREE.BoxGeometry(1.05, 0.25, 1.05);
            const obsMat = new THREE.MeshStandardMaterial({
                map: obsTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            const obsMesh = new THREE.Mesh(obsGeo, obsMat);
            obsMesh.position.set(0, -0.575, 0);
            beaconGroup.add(obsMesh);

            // 3. Inner Floating Beacon Core sitting inside glass box
            const beaconCoreTexture = textureLoader.load('/images/beacon.png');
            beaconCoreTexture.magFilter = THREE.NearestFilter;
            beaconCoreTexture.minFilter = THREE.NearestFilter;

            const beaconCoreGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
            const beaconCoreMat = new THREE.MeshStandardMaterial({
                map: beaconCoreTexture,
                color: 0xffffff,
                roughness: 0.1,
                side: THREE.DoubleSide
            });
            activeBeaconCore = new THREE.Mesh(beaconCoreGeo, beaconCoreMat);
            activeBeaconCore.position.set(0, -0.025, 0);

            // White Hot Center Core Box
            const coreHotGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
            const coreHotMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.95
            });
            const coreHotMesh = new THREE.Mesh(coreHotGeo, coreHotMat);
            activeBeaconCore.add(coreHotMesh);
            beaconGroup.add(activeBeaconCore);

            // 3.5 SEPARATE 3D NETHER STAR RENDER PLACED IN FRONT OF THE BEACON
            const netherStarTexture = textureLoader.load('/images/items/Nether_Star.gif');
            netherStarTexture.magFilter = THREE.NearestFilter;
            netherStarTexture.minFilter = THREE.NearestFilter;

            netherStarFrontGroup = new THREE.Group();

            // 1. FULL INTACT NETHER STAR (Pristine, 0 seams, 100% sharp for Standby state)
            const fullStarGeo = new THREE.PlaneGeometry(0.65, 0.65);
            fullStarMat = new THREE.MeshBasicMaterial({
                map: netherStarTexture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide,
                opacity: 1.0
            });
            const fullStar1 = new THREE.Mesh(fullStarGeo, fullStarMat);
            const fullStar2 = new THREE.Mesh(fullStarGeo, fullStarMat);
            fullStar2.rotation.y = Math.PI / 2;
            netherStarFrontGroup.add(fullStar1);
            netherStarFrontGroup.add(fullStar2);

            // 2. 4 EXPLOSION SHARDS (Used ONLY during Supernova explosion animation)
            const shardUVs = [
                [0, 0.5, 0.5, 1.0],   // 1. Top-Left
                [0.5, 1.0, 0.5, 1.0], // 2. Top-Right
                [0, 0.5, 0, 0.5],     // 3. Bottom-Left
                [0.5, 1.0, 0, 0.5]    // 4. Bottom-Right
            ];

            const shardOffsets = [
                { x: -0.16, y: 0.16 },
                { x: 0.16, y: 0.16 },
                { x: -0.16, y: -0.16 },
                { x: 0.16, y: -0.16 }
            ];

            starShards.length = 0;
            starShardMats.length = 0;

            for (let s = 0; s < 4; s++) {
                const sGeo = new THREE.PlaneGeometry(0.35, 0.35);
                const u = shardUVs[s];
                const uvAttr = sGeo.attributes.uv;
                uvAttr.setXY(0, u[0], u[3]);
                uvAttr.setXY(1, u[1], u[3]);
                uvAttr.setXY(2, u[0], u[2]);
                uvAttr.setXY(3, u[1], u[2]);

                const sMat = new THREE.MeshBasicMaterial({
                    map: netherStarTexture,
                    transparent: true,
                    opacity: 0, // Hidden until explosion triggers!
                    side: THREE.DoubleSide
                });
                const sMesh = new THREE.Mesh(sGeo, sMat);
                sMesh.position.set(shardOffsets[s].x, shardOffsets[s].y, 0);

                const sMeshCross = new THREE.Mesh(sGeo, sMat);
                sMeshCross.rotation.y = Math.PI / 2;
                sMesh.add(sMeshCross);

                starShards.push(sMesh);
                starShardMats.push(sMat);
                netherStarFrontGroup.add(sMesh);
            }

            netherStarFrontGroup.position.set(0, -0.05, 0.1);
            mainGroup.add(netherStarFrontGroup);

            // 3.1. 3D SUPERNOVA EXPLOSION SHOCKWAVE RING
            const shockwaveGeo = new THREE.RingGeometry(0.1, 0.4, 32);
            const shockwaveMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
            shockwaveMesh.position.set(0, -0.05, 0.11);
            mainGroup.add(shockwaveMesh);

            // 3.2. 3D EXPLOSION SPARKS BURST (120 PARTICLE SHARDS)
            const expPosArr = new Float32Array(expSparkCount * 3);
            const expColArr = new Float32Array(expSparkCount * 3);

            const sparkPaletteColors = [
                new THREE.Color("#00637c"),
                new THREE.Color("#ff00b7"),
                new THREE.Color("#00aeef"),
                new THREE.Color("#10b981"),
                new THREE.Color("#ffffff")
            ];

            expVelArr.length = 0;
            for (let e = 0; e < expSparkCount; e++) {
                expPosArr[e * 3] = 0;
                expPosArr[e * 3 + 1] = -0.05;
                expPosArr[e * 3 + 2] = 0.1;

                const theta = Math.random() * Math.PI * 2;
                const phi = (Math.random() - 0.5) * Math.PI;
                const speed = 1.5 + Math.random() * 3.5;

                expVelArr.push(new THREE.Vector3(
                    Math.cos(phi) * Math.cos(theta) * speed,
                    Math.sin(phi) * speed,
                    Math.cos(phi) * Math.sin(theta) * speed
                ));

                const col = sparkPaletteColors[e % sparkPaletteColors.length];
                expColArr[e * 3] = col.r;
                expColArr[e * 3 + 1] = col.g;
                expColArr[e * 3 + 2] = col.b;
            }

            const expGeo = new THREE.BufferGeometry();
            expGeo.setAttribute('position', new THREE.BufferAttribute(expPosArr, 3));
            expGeo.setAttribute('color', new THREE.BufferAttribute(expColArr, 3));

            const expSparkTexture = createSoftGlowParticleTexture();
            const expMat = new THREE.PointsMaterial({
                map: expSparkTexture,
                vertexColors: true,
                size: 0.28,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            expPoints = new THREE.Points(expGeo, expMat);
            mainGroup.add(expPoints);

            // 4. ACTIVE 3D BEACON BEAM (MINECRAFT SQUARE PRISM COLUMNS)
            activeBeamTexture = textureLoader.load('/images/Beacon_Beam_(texture).png');
            activeBeamTexture.wrapS = THREE.RepeatWrapping;
            activeBeamTexture.wrapT = THREE.RepeatWrapping;
            activeBeamTexture.repeat.set(1, 8);
            activeBeamTexture.magFilter = THREE.NearestFilter;
            activeBeamTexture.minFilter = THREE.NearestFilter;

            // 1. Inner Core Square Column (Minecraft White Beam)
            const beamCoreGeo = new THREE.BoxGeometry(0.30, 20, 0.30);
            beamCoreGeo.translate(0, 10, 0); // Position starting from Beacon top face
            const beamCoreMat = new THREE.MeshBasicMaterial({
                map: activeBeamTexture,
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            activeBeamCoreMesh = new THREE.Mesh(beamCoreGeo, beamCoreMat);

            // 2. Outer Translucent Square Column Shield (Minecraft Tinted Beam - Compact & Tight)
            const beamAuraGeo = new THREE.BoxGeometry(0.46, 20, 0.46);
            beamAuraGeo.translate(0, 10, 0);
            const beamAuraMat = new THREE.MeshBasicMaterial({
                map: activeBeamTexture,
                color: stageColor,
                transparent: true,
                opacity: 0.45,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            activeBeamAuraMesh = new THREE.Mesh(beamAuraGeo, beamAuraMat);

            beaconGroup.add(activeBeamCoreMesh);
            beaconGroup.add(activeBeamAuraMesh);

            // 6. DYNAMIC LIVE 3D ELECTRIC LIGHTNING ARC MESH STRIPS FOR ALL 4 STAFF MEMBERS IN THREE.JS
            const numLightningSegs = 32;
            const numVerts = (numLightningSegs + 1) * 2;
            const indices: number[] = [];

            for (let i = 0; i < numLightningSegs; i++) {
                const row1 = i * 2;
                const row2 = (i + 1) * 2;
                indices.push(row1, row1 + 1, row2);
                indices.push(row1 + 1, row2 + 1, row2);
            }

            staffRayNames.forEach(name => {
                const cGeo = new THREE.BufferGeometry();
                cGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
                cGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
                cGeo.setIndex(indices);

                const cMat = new THREE.MeshBasicMaterial({
                    vertexColors: true,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                });
                const cMesh = new THREE.Mesh(cGeo, cMat);
                cMesh.renderOrder = 999;
                mainGroup.add(cMesh);

                const aGeo = new THREE.BufferGeometry();
                aGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
                aGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
                aGeo.setIndex(indices);

                const aMat = new THREE.MeshBasicMaterial({
                    vertexColors: true,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                });
                const aMesh = new THREE.Mesh(aGeo, aMat);
                aMesh.renderOrder = 998;
                mainGroup.add(aMesh);

                staff3DRaysDict[name] = { coreMesh: cMesh, coreMat: cMat, auraMesh: aMesh, auraMat: aMat };
            });
        } else {
            let textureUrl = '/images/items/Block_of_Netherite_JE1_BE1.webp';
            if (stageId === 1) textureUrl = '/images/items/Emerald_JE3_BE3.png';
            if (stageId === 4) textureUrl = '/images/items/Block_of_Netherite_JE1_BE1.webp';

            const mcTexture = textureLoader.load(textureUrl);
            mcTexture.magFilter = THREE.NearestFilter;
            mcTexture.minFilter = THREE.NearestFilter;

            const blockGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
            const blockMat = new THREE.MeshStandardMaterial({
                map: mcTexture,
                roughness: 0.2,
                metalness: stageId === 4 ? 0.8 : 0.1,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide
            });

            const blockMesh = new THREE.Mesh(blockGeo, blockMat);
            mainGroup.add(blockMesh);

            const wireframeGeo = new THREE.WireframeGeometry(blockGeo);
            const wireframeMat = new THREE.LineBasicMaterial({ color: stageColor, transparent: true, opacity: 0.4 });
            const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
            blockMesh.add(wireframe);

            const innerGeo = new THREE.BoxGeometry(0.875, 0.875, 0.875);
            const innerMat = new THREE.MeshStandardMaterial({
                map: mcTexture,
                color: stageColor,
                emissive: stageColor,
                emissiveIntensity: 0.7,
                roughness: 0.1
            });
            const innerMesh = new THREE.Mesh(innerGeo, innerMat);
            mainGroup.add(innerMesh);
        }

        // 4. Floating Ambient 3D Particle Cloud
        const particleCount = 80;
        const particlePositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const radius = 1.4 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = radius * Math.cos(phi);
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const particleMat = new THREE.PointsMaterial({
            map: createSoftGlowParticleTexture(),
            color: stageColor,
            size: 0.25,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        const reusableTargetColor = new THREE.Color();
        const reusableColorA = new THREE.Color();
        const reusableColorB = new THREE.Color();
        const reusableColorWhite = new THREE.Color(0xffffff);
        const reusableVCol = new THREE.Color();

        const reusableTargetPos3D = new THREE.Vector3(0, -0.05, 0.1);
        const reusableRayVector = new THREE.Vector3();
        const reusableDeltaVec = new THREE.Vector3();
        const reusableUpVec = new THREE.Vector3(0, 0, 1);
        const reusableSideVec = new THREE.Vector3();
        const reusableDefaultAnchor = new THREE.Vector3(0, -1.05, 0.1);

        const staticStaffCardAnchors: { [key: string]: THREE.Vector3 } = {
            "KillubysmaliVT": new THREE.Vector3(-2.1, -1.05, 0.1),
            "Neroferno ultranix": new THREE.Vector3(-0.7, -1.05, 0.1),
            "Xurlito": new THREE.Vector3(0.7, -1.05, 0.1),
            "JAPA325": new THREE.Vector3(2.1, -1.05, 0.1)
        };

        // 5. Animation Loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            if (mixer) {
                mixer.update(delta);
            }

            // 3 PROGRESSIVE BEACON STATES:
            // State 0: STANDBY (0 linked) -> Beam OFF (0 opacity)
            // State 1: CHARGING (1-3 linked) -> 2.5s Color Flare burst on new connect
            // State 2: 100% FULL SYNC (4/4 linked) -> Beam PERMANENTLY ACTIVE (0.95 opacity)
            const currentLinkedCount = linkedMembersRef.current.length;
            const isFullyLinked = currentLinkedCount === 4;

            // Detect new member connection for temporary flare burst
            const prevCount = prevLinkedMembersRef.current.length;
            if (currentLinkedCount > prevCount && currentLinkedCount < 4) {
                flareTimerRef.current = 2.5;
            }

            if (flareTimerRef.current > 0) {
                flareTimerRef.current -= delta;
            }
            const isFlaring = flareTimerRef.current > 0;

            // Detect 4/4 Full Sync to trigger 3D Supernova Explosion after a 0.4s 4-ray anticipation feed
            if (isFullyLinked && !hasExplodedRef.current) {
                if (explosionDelayTimerRef.current > 0) {
                    explosionDelayTimerRef.current -= delta;
                } else {
                    hasExplodedRef.current = true;
                    explosionTimerRef.current = 1.6;
                }
            }
            if (!isFullyLinked) {
                hasExplodedRef.current = false;
                explosionDelayTimerRef.current = 0.4;
            }

            if (explosionTimerRef.current > 0) {
                explosionTimerRef.current -= delta;
                const progress = (1.6 - explosionTimerRef.current) / 1.6; // 0.0 to 1.0

                // 1. Expand shockwave ring
                if (shockwaveMesh) {
                    const swScale = 0.2 + progress * 6.5;
                    shockwaveMesh.scale.set(swScale, swScale, swScale);
                    (shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1.0 - progress * 1.2));
                }

                // 2. Animate 120 particle sparks flying outward in 3D
                if (expPoints) {
                    (expPoints.material as THREE.PointsMaterial).opacity = Math.max(0, 1.0 - progress);
                    const pArr = expPoints.geometry.attributes.position.array as Float32Array;
                    for (let e = 0; e < expSparkCount; e++) {
                        const vel = expVelArr[e];
                        pArr[e * 3] += vel.x * delta * 2.2;
                        pArr[e * 3 + 1] += vel.y * delta * 2.2;
                        pArr[e * 3 + 2] += vel.z * delta * 2.2;
                    }
                    expPoints.geometry.attributes.position.needsUpdate = true;
                }

                // Hide pristine full star during explosion
                if (fullStarMat) fullStarMat.opacity = 0;

                // 3. Animate 4 Nether Star shards splitting & flying apart into disappearance!
                const baseOffsets = [
                    { x: -0.16, y: 0.16, dx: -1.5, dy: 1.5 },  // 1. Top-Left
                    { x: 0.16, y: 0.16, dx: 1.5, dy: 1.5 },    // 2. Top-Right
                    { x: -0.16, y: -0.16, dx: -1.5, dy: -1.5 },// 3. Bottom-Left
                    { x: 0.16, y: -0.16, dx: 1.5, dy: -1.5 }   // 4. Bottom-Right
                ];

                starShards.forEach((shard, s) => {
                    const bo = baseOffsets[s];
                    shard.position.x = bo.x + bo.dx * progress * 1.8;
                    shard.position.y = bo.y + bo.dy * progress * 1.8;
                    shard.position.z = progress * 0.8;
                    shard.rotation.z = progress * 7.0 * (s % 2 === 0 ? 1 : -1);

                    if (starShardMats[s]) {
                        starShardMats[s].opacity = Math.max(0, 1.0 - progress * 1.25);
                    }
                });
            } else {
                // Standby or after-explosion state
                if (isFullyLinked) {
                    // Exploded & Disappeared permanently!
                    if (fullStarMat) fullStarMat.opacity = 0;
                    starShardMats.forEach(mat => { mat.opacity = 0; });
                } else {
                    // Pristine intact Nether Star in Standby (0 SEAMS / ZERO LINES)
                    if (fullStarMat) fullStarMat.opacity = 1.0;
                    starShardMats.forEach(mat => { mat.opacity = 0; });
                }

                if (shockwaveMesh) (shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = 0;
                if (expPoints) (expPoints.material as THREE.PointsMaterial).opacity = 0;
            }

            // Minecraft Beacon Beam continuous rotation & texture scrolling
            if (activeBeamCoreMesh) {
                activeBeamCoreMesh.rotation.y += delta * 1.5;
            }
            if (activeBeamAuraMesh) {
                activeBeamAuraMesh.rotation.y -= delta * 0.9;
            }
            if (activeBeamTexture) {
                activeBeamTexture.offset.y -= delta * 2.5;
            }

            // Determine Target Beam Opacity
            let targetCoreOpacity = 0;
            let targetAuraOpacity = 0;

            if (isFullyLinked) {
                targetCoreOpacity = 0.95;
                targetAuraOpacity = 0.6;
            } else if (isFlaring || dragActiveMemberRef.current) {
                targetCoreOpacity = 0.85;
                targetAuraOpacity = 0.5;
            } else {
                // Beam disappears 100% completely (0% opacity)
                targetCoreOpacity = 0;
                targetAuraOpacity = 0;
            }

            // Smooth opacity transition for Beacon Beam
            if (activeBeamCoreMesh && activeBeamCoreMesh.material instanceof THREE.MeshBasicMaterial) {
                activeBeamCoreMesh.material.opacity = THREE.MathUtils.lerp(activeBeamCoreMesh.material.opacity, targetCoreOpacity, 0.1);
            }
            if (activeBeamAuraMesh && activeBeamAuraMesh.material instanceof THREE.MeshBasicMaterial) {
                activeBeamAuraMesh.material.opacity = THREE.MathUtils.lerp(activeBeamAuraMesh.material.opacity, targetAuraOpacity, 0.1);
            }

            // ponytail: Nether Star Core stays 100% stationary and still
            if (activeBeaconCore) {
                activeBeaconCore.scale.set(1, 1, 1);
                activeBeaconCore.rotation.set(0, 0, 0);
            }

            // Smooth 3D Color Transition Lerp matched to staff member color during flare or drag
            let targetColorHex = accentColor;
            if (isFlaring && flaringColorRef.current) {
                targetColorHex = flaringColorRef.current;
            } else if (dragActiveMemberRef.current && activeStaffColorRef.current) {
                targetColorHex = activeStaffColorRef.current;
            }

            reusableTargetColor.set(targetColorHex);
            if (activeBeamAuraMesh && activeBeamAuraMesh.material instanceof THREE.MeshBasicMaterial) {
                activeBeamAuraMesh.material.color.lerp(reusableTargetColor, 0.08);
            }
            if (pointLight1) {
                pointLight1.color.lerp(reusableTargetColor, 0.08);
            }
            if (particleMat) {
                particleMat.color.lerp(reusableTargetColor, 0.08);
            }

            // LIVE THREE.JS 3D ELECTRIC BEAMS FOR ALL CONNECTED & DRAGGING STAFF MEMBERS SIMULTANEOUSLY
            staffRayNames.forEach(memberName => {
                const rayEntry = staff3DRaysDict[memberName];
                if (!rayEntry) return;

                const isLinked = linkedMembersRef.current.includes(memberName);
                const isDragging = dragActiveMemberRef.current === memberName;
                // Lasers vanish immediately right as the explosion initiates!
                const raysShouldDisappear = isFullyLinked && hasExplodedRef.current;

                if ((!isLinked && !isDragging) || raysShouldDisappear) {
                    rayEntry.coreMat.opacity = 0;
                    rayEntry.auraMat.opacity = 0;
                    return;
                }

                rayEntry.coreMat.opacity = 0.98;
                rayEntry.auraMat.opacity = 0.75;

                reusableTargetPos3D.set(0, -0.05, 0.1);

                if (isDragging && cursorPosRef.current && container) {
                    const rect = container.getBoundingClientRect();
                    const mouseX = cursorPosRef.current.x;
                    const mouseY = cursorPosRef.current.y;
                    const ndcX = (mouseX / rect.width) * 2 - 1;
                    const ndcY = -(mouseY / rect.height) * 2 + 1;
                    reusableRayVector.set(ndcX, ndcY, 0.5);
                    reusableRayVector.unproject(camera);
                    const dir = reusableRayVector.sub(camera.position).normalize();
                    const targetZ = 0.1;
                    const distanceToPlane = (targetZ - camera.position.z) / dir.z;
                    reusableTargetPos3D.copy(camera.position).add(dir.multiplyScalar(distanceToPlane));
                }

                const startAnchor3D = staticStaffCardAnchors[memberName] || reusableDefaultAnchor;
                reusableDeltaVec.subVectors(reusableTargetPos3D, startAnchor3D);

                // Perpendicular vector for ribbon width facing camera
                reusableSideVec.crossVectors(reusableDeltaVec, reusableUpVec).normalize();
                if (reusableSideVec.lengthSq() < 0.001) reusableSideVec.set(1, 0, 0);

                // Color A (Base at Card Node) -> Color B (Top at Beacon / Cursor)
                const palette = staffColorPalettes[memberName];
                const colorA = palette ? reusableColorA.set(palette.primary) : reusableTargetColor;
                const colorB = palette ? reusableColorB.set(palette.secondary) : reusableColorWhite;

                const numSegs = 32;

                const corePosAttr = rayEntry.coreMesh.geometry.attributes.position as THREE.BufferAttribute;
                const coreColAttr = rayEntry.coreMesh.geometry.attributes.color as THREE.BufferAttribute;
                const corePosArr = corePosAttr.array as Float32Array;
                const coreColArr = coreColAttr.array as Float32Array;

                const auraPosAttr = rayEntry.auraMesh.geometry.attributes.position as THREE.BufferAttribute;
                const auraColAttr = rayEntry.auraMesh.geometry.attributes.color as THREE.BufferAttribute;
                const auraPosArr = auraPosAttr.array as Float32Array;
                const auraColArr = auraColAttr.array as Float32Array;

                for (let i = 0; i <= numSegs; i++) {
                    const t = i / numSegs;
                    const envelope = Math.sin(t * Math.PI); // 0 at endpoints, 1 in middle

                    // Real-time Chaotic Electric Lightning Jitter / Twitch
                    let jx = 0, jy = 0, jz = 0;
                    if (i > 0 && i < numSegs) {
                        const twitch = Math.sin(elapsedTime * 28 + i * 1.7) * 0.12 + (Math.random() - 0.5) * 0.14;
                        jx = twitch * envelope;
                        jy = (Math.cos(elapsedTime * 22 + i * 2.1) * 0.12 + (Math.random() - 0.5) * 0.14) * envelope;
                        jz = (Math.sin(elapsedTime * 19 + i * 1.3) * 0.08 + (Math.random() - 0.5) * 0.1) * envelope;
                    }

                    const px = startAnchor3D.x + reusableDeltaVec.x * t + jx;
                    const py = startAnchor3D.y + reusableDeltaVec.y * t + jy;
                    const pz = startAnchor3D.z + reusableDeltaVec.z * t + jz;

                    // Core Ribbon Width
                    const coreHalfW = (0.02 * envelope + 0.012);
                    corePosArr[i * 6] = px - reusableSideVec.x * coreHalfW;
                    corePosArr[i * 6 + 1] = py - reusableSideVec.y * coreHalfW;
                    corePosArr[i * 6 + 2] = pz - reusableSideVec.z * coreHalfW;
                    corePosArr[i * 6 + 3] = px + reusableSideVec.x * coreHalfW;
                    corePosArr[i * 6 + 4] = py + reusableSideVec.y * coreHalfW;
                    corePosArr[i * 6 + 5] = pz + reusableSideVec.z * coreHalfW;

                    // Aura Ribbon Width
                    const auraHalfW = (0.08 * envelope + 0.035);
                    auraPosArr[i * 6] = px - reusableSideVec.x * auraHalfW;
                    auraPosArr[i * 6 + 1] = py - reusableSideVec.y * auraHalfW;
                    auraPosArr[i * 6 + 2] = pz - reusableSideVec.z * auraHalfW;
                    auraPosArr[i * 6 + 3] = px + reusableSideVec.x * auraHalfW;
                    auraPosArr[i * 6 + 4] = py + reusableSideVec.y * auraHalfW;
                    auraPosArr[i * 6 + 5] = pz + reusableSideVec.z * auraHalfW;

                    // Interpolate vertex colors along 3D lightning arc (colorA -> colorB)
                    reusableVCol.copy(colorA).lerp(colorB, t);

                    coreColArr[i * 6] = 1.0;
                    coreColArr[i * 6 + 1] = 1.0;
                    coreColArr[i * 6 + 2] = 1.0;
                    coreColArr[i * 6 + 3] = 1.0;
                    coreColArr[i * 6 + 4] = 1.0;
                    coreColArr[i * 6 + 5] = 1.0;

                    auraColArr[i * 6] = reusableVCol.r;
                    auraColArr[i * 6 + 1] = reusableVCol.g;
                    auraColArr[i * 6 + 2] = reusableVCol.b;
                    auraColArr[i * 6 + 3] = reusableVCol.r;
                    auraColArr[i * 6 + 4] = reusableVCol.g;
                    auraColArr[i * 6 + 5] = reusableVCol.b;
                }

                corePosAttr.needsUpdate = true;
                coreColAttr.needsUpdate = true;
                auraPosAttr.needsUpdate = true;
                auraColAttr.needsUpdate = true;
            });

            // Static Front-facing orientation (No 360 rotation, No floating bobbing)
            mainGroup.rotation.set(0, 0, 0);

            // ponytail: rock-solid stationary position (no Math.sin bobbing!)
            const yOffset = stageId === 3 ? -0.55 : 0;
            mainGroup.position.y = yOffset;

            // Particles orbital rotation
            particles.rotation.y = elapsedTime * 0.12;
            particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        // 6. Resize Handler
        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // 7. Cleanup
        return () => {
            isSubscribed = false;
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            particleGeo.dispose();
            particleMat.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [stageId, accentColor]);

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full pointer-events-none select-none" 
            aria-hidden="true"
        />
    );
};
