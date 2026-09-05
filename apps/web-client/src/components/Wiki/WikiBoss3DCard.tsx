import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Flame,
  Zap,
  RotateCcw,
  Shield,
  Heart,
  Maximize2,
  Compass,
  Sparkles,
  Swords,
  MapPin,
  Coins,
  Award,
  Play,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { resolveAssetUrl } from "../../utils/assetUtils";

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
  activeClipOverride?: string | null;
  modelPath?: string;
  textureUrl?: string;
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
  cardTheme?: "red" | "emerald" | "amber" | "purple" | "cyan" | "slate";
  threatLabel?: string;
  hpLabel?: string;
  damageLabel?: string;
  speedLabel?: string;
  locationLabel?: string;
  dropsLabel?: string;
  bountyLabel?: string;
}

const PHASE_1_ATTACKS: BossAttack[] = [
  {
    name: "Zarpaso fatal",
    type: "MELEE",
    damage: "20 HP (Empuje + Combo)",
    description:
      "The Forgotten Terror arremete velozmente en el aire ejecutando una estocada frontal con sus garras de basalto y concreto.",
    animation_clip: "claw2",
  },
  {
    name: "Zarpaso doble",
    type: "MELEE",
    damage: "35 HP Crítico",
    description:
      "Golpe cruzado con ambas garras que inflige daño masivo y desgarra armaduras.",
    animation_clip: "claw1",
  },
  {
    name: "Casteo Wither",
    type: "PROYECTIL",
    damage: "25 HP + Wither II",
    description:
      "Dispara una ráfaga de proyectiles de calaveras guiadas que persiguen a los jugadores cercanos.",
    animation_clip: "shoot",
  },
  {
    name: "Ciclón Wither",
    type: "AOE",
    damage: "30 HP (Radio 14 Bloques)",
    description:
      "Giro ciclónico a gran velocidad que barre la arena y repele con fuerza gravitacional.",
    animation_clip: "roundhouse",
  },
  {
    name: "Quebranta armaduras",
    type: "DEBUFF",
    damage: "Ruptura de Escudos",
    description:
      "Ataque descendente contundente que desactiva los escudos y reduce la protección física.",
    animation_clip: "overhead_swipe",
  },
  {
    name: "Pozos Wither",
    type: "INVOCACIÓN",
    damage: "15 HP/seg Ácido",
    description:
      "Genera charcos de podredumbre oscura en el suelo que dañan de forma continua.",
    animation_clip: "wither_pool",
  },
];

const PHASE_2_ATTACKS: BossAttack[] = [
  {
    name: "Impacto Aplastante de Terror",
    type: "MELEE PESADO",
    damage: "45 HP Físico",
    description:
      "Salto colosal con aplastamiento masivo en área con sus garras terrestres.",
    animation_clip: "left_smash2",
  },
  {
    name: "Barrido de Garras & Coletazo",
    type: "AOE MELEE",
    damage: "35 HP Físico",
    description:
      "Giro circular rasante a nivel del suelo que barre a múltiples jugadores a la vez.",
    animation_clip: "right_smash2",
  },
  {
    name: "Erupción Declamatoria (Decapitación <300 HP)",
    type: "DECAPITACIÓN",
    damage: "99% Resistencia Divina",
    description:
      "Se decapita a sí mismo arrancándose el cráneo para obtener invulnerabilidad y velocidad extrema.",
    animation_clip: "head_off",
  },
  {
    name: "Frenesí de Sombras (Cráneo en Mano)",
    type: "PROYECTIL",
    damage: "50 HP Explosivo",
    description:
      "Blandiendo su propio cráneo arrancado, lanza proyectiles explosivos a quemarropa.",
    animation_clip: "head_off_swing_shoot",
  },
];

function getEntityDefaultAttacks(
  bossName: string,
  category: string,
  selectedPhase: number,
): BossAttack[] {
  const nameLower = (bossName || "").toLowerCase();
  const catLower = (category || "").toLowerCase();

  if (nameLower.includes("wither") || nameLower.includes("terror")) {
    return selectedPhase === 2 ? PHASE_2_ATTACKS : PHASE_1_ATTACKS;
  }

  if (
    nameLower.includes("drake") ||
    nameLower.includes("dragón") ||
    nameLower.includes("dragon")
  ) {
    return [
      {
        name: "Mordisco Desgarrador",
        type: "MELEE",
        damage: "25 HP Físico",
        description:
          "Potente mordedura con fauces blindadas que causa sangrado severo.",
        animation_clip: "bite",
      },
      {
        name: "Aliento de Fuego Dracónico",
        type: "AOE FUEGO",
        damage: "40 HP Ígneo",
        description:
          "Exhala una llamarada continua que calcina a todos los jugadores en un cono de 8 bloques.",
        animation_clip: "breath",
      },
      {
        name: "Coletazo de Torbellino",
        type: "AOE EMPUJE",
        damage: "20 HP Físico",
        description:
          "Giro violento con la cola que repele a los atacantes por la espalda.",
        animation_clip: "tail",
      },
      {
        name: "Rugido Primordial",
        type: "DEBUFF",
        damage: "Efecto Debilidad II",
        description:
          "Grito intimidante que paraliza temporalmente a las víctimas cercanas.",
        animation_clip: "roar",
      },
    ];
  }

  if (
    nameLower.includes("automaton") ||
    nameLower.includes("gólem") ||
    nameLower.includes("golem")
  ) {
    return [
      {
        name: "Puño de Engranaje Pesado",
        type: "MELEE",
        damage: "30 HP Físico",
        description:
          "Golpe demoledor propulsado por vapor que abolla armaduras de diamante.",
        animation_clip: "punch",
      },
      {
        name: "Sobrecarga de Vapor Cinético",
        type: "AOE",
        damage: "25 HP Térmico",
        description:
          "Libera vapor a presión extrema que repele y ciega a los enemigos en área.",
        animation_clip: "smash",
      },
      {
        name: "Descarga Eléctrica de Núcleo",
        type: "PROYECTIL",
        damage: "35 HP Rayo",
        description:
          "Dispara un haz energético concentrado desde su pecho mecánico.",
        animation_clip: "laser",
      },
      {
        name: "Baluarte Fortificado",
        type: "DEFENSA",
        damage: "80% Resistencia",
        description:
          "Adopta una postura defensiva que reduce enormemente todo daño recibido.",
        animation_clip: "guard",
      },
    ];
  }

  if (nameLower.includes("wendigo")) {
    return [
      {
        name: "Desgarro de Furia Glacial",
        type: "MELEE",
        damage: "35 HP Cortante",
        description:
          "Zarpazos frenéticos capaces de penetrar escudos y causar congelación.",
        animation_clip: "slash",
      },
      {
        name: "Chillido de Hambruna",
        type: "AOE MÁGICO",
        damage: "Ceguera & Lentitud",
        description:
          "Aullido aterrador que desorienta y frena a los cazadores en el bosque.",
        animation_clip: "scream",
      },
      {
        name: "Salto de Emboscada Nocturna",
        type: "EMBESTIDA",
        damage: "30 HP Impacto",
        description:
          "Salto acrobático desde las sombras para derribar a su presa.",
        animation_clip: "leap",
      },
    ];
  }

  if (nameLower.includes("chupacabra")) {
    return [
      {
        name: "Drenaje Vampírico",
        type: "MELEE",
        damage: "20 HP (Roba Vida)",
        description:
          "Muerde a la víctima drenando su vitalidad para curarse a sí mismo.",
        animation_clip: "bite",
      },
      {
        name: "Abalanzada Sombría",
        type: "EMBESTIDA",
        damage: "18 HP Veloz",
        description: "Acometida a gran velocidad esquivando ataques frontales.",
        animation_clip: "jump",
      },
      {
        name: "Mirada Intimidante",
        type: "DEBUFF",
        damage: "Náusea I",
        description:
          "Fija sus ojos brillantes causando desorientación instantánea.",
        animation_clip: "idle",
      },
    ];
  }

  if (nameLower.includes("chesed")) {
    return [
      {
        name: "Falla Espacio-Temporal",
        type: "AOE",
        damage: "45 HP Cinético",
        description:
          "Distorsiona la gravedad atrayendo y aplastando a todos los objetivos.",
        animation_clip: "slam",
      },
      {
        name: "Descarga Cinética Radial",
        type: "PROYECTIL",
        damage: "30 HP Eléctrico",
        description: "Proyecta ondas de energía cinética de largo alcance.",
        animation_clip: "shoot",
      },
    ];
  }

  if (nameLower.includes("geburah")) {
    return [
      {
        name: "Tajo del Juicio Carmesí",
        type: "MELEE",
        damage: "60 HP Sangrado",
        description:
          "Corte demoledor de gran espada que ignora la protección de armadura.",
        animation_clip: "slash",
      },
      {
        name: "Lanza del Castigo Divino",
        type: "PENETRACIÓN",
        damage: "50 HP Perforante",
        description:
          "Estocada lineal hiper-sónica que atraviesa múltiples objetivos.",
        animation_clip: "thrust",
      },
    ];
  }

  if (nameLower.includes("malkuth")) {
    return [
      {
        name: "Erupción Elemental Ígnea",
        type: "AOE",
        damage: "40 HP Fuego",
        description:
          "Golpea el suelo desatando pilares de magma y fuego primordial.",
        animation_clip: "erupt",
      },
      {
        name: "Vórtice de Escarcha Abisal",
        type: "AOE FRÍO",
        damage: "25 HP + Congelación",
        description: "Onda expansiva congelante que inmoviliza a los enemigos.",
        animation_clip: "freeze",
      },
    ];
  }

  if (
    catLower.includes("critters") ||
    catLower.includes("pacifico") ||
    catLower.includes("pacífico") ||
    catLower.includes("mascota") ||
    catLower.includes("fauna")
  ) {
    return [
      {
        name: "Acariciar & Jugar",
        type: "INTERACCIÓN",
        damage: "Amistad +10",
        description:
          "Interactúa con la criatura para aumentar su lealtad y felicidad.",
        animation_clip: "interact",
      },
      {
        name: "Truco / Mimetismo",
        type: "HABILIDAD",
        damage: "Evasión 100%",
        description:
          "Realiza su pose característica y se camufla con el entorno.",
        animation_clip: "roll",
      },
      {
        name: "Comer Golosina",
        type: "DOMESTICACIÓN",
        damage: "Regeneración",
        description:
          "Se alimenta de bayas o vegetación para restaurar su vitalidad.",
        animation_clip: "eat",
      },
    ];
  }

  return [
    {
      name: "Ataque de Combate",
      type: "MELEE",
      damage: "Ataque Físico",
      description: "Ataque estándar de la criatura contra aventureros.",
      animation_clip: "attack",
    },
  ];
}

const EMPTY_DROPS: string[] = [];
const EMPTY_PHASES: BossPhaseData[] = [];

export const WikiBoss3DCard: React.FC<WikiBoss3DCardProps> = ({
  _minimal3dOnly: minimal3dOnly = false,
  _activeClipOverride: activeClipOverride,
  modelPath = "/models/toro_wither.gltf",
  _textureUrl: textureUrl,
  modelPathPhase2,
  bossName = "Entidad",
  category = "",
  subtitle = "Bestiario • Entidad Modificada",
  hp = "100 HP",
  hpPhase2,
  damage = "Ataque Estándar",
  damagePhase2,
  armor = "Sin Armadura",
  speed = "Velocidad Normal",
  location = "Overworld / Estructura",
  spawnMethod = "Generación Natural",
  description = "",
  drops = EMPTY_DROPS,
  kcReward = 0,
  phases = EMPTY_PHASES,
  phase1Attacks,
  phase2Attacks,
  _cardTheme: cardTheme,
  threatLabel,
  hpLabel,
  damageLabel,
  speedLabel,
  locationLabel,
  dropsLabel,
  bountyLabel,
}: WikiBoss3DCardProps & {
  _minimal3dOnly?: boolean;
  _activeClipOverride?: string | null;
  _textureUrl?: string;
  _cardTheme?: string;
}) => {
  void minimal3dOnly;
  void activeClipOverride;
  void textureUrl;
  void cardTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const isBoss =
    category === "bosses" ||
    category.includes("boss") ||
    bossName.toLowerCase().includes("terror") ||
    bossName.toLowerCase().includes("chesed") ||
    bossName.toLowerCase().includes("geburah") ||
    bossName.toLowerCase().includes("malkuth");
  const isHostile =
    !isBoss &&
    (category === "mobs_hostiles" ||
      category.includes("hostil") ||
      category.includes("mythology"));
  const isCompanion =
    !isBoss &&
    !isHostile &&
    (category === "mobs_pacificos" ||
      category.includes("pacifico") ||
      category.includes("critters"));

  const themeStyles = useMemo(() => {
    if (isBoss) {
      return {
        cardBg:
          "border-rose-900/40 bg-gradient-to-br from-rose-950/20 via-neutral-900/95 to-neutral-950",
        viewportBg:
          "bg-gradient-to-b from-rose-950/25 via-neutral-950 to-neutral-950",
        badgeBg: "bg-rose-950/60 border-rose-800/60 text-rose-300",
        activeBtn: "bg-rose-950/80 text-rose-100 border-rose-700/70",
        activePhaseBtn: "bg-rose-900/40 border-rose-600/70 text-rose-200",
        accentText: "text-rose-400",
        grid1: 0x881337,
        grid2: 0x4c0519,
      };
    }
    if (isHostile) {
      return {
        cardBg:
          "border-purple-900/30 bg-gradient-to-br from-purple-950/15 via-neutral-900/95 to-neutral-950",
        viewportBg:
          "bg-gradient-to-b from-purple-950/20 via-neutral-950 to-neutral-950",
        badgeBg: "bg-purple-950/50 border-purple-800/50 text-purple-300",
        activeBtn: "bg-purple-950/80 text-purple-100 border-purple-700/70",
        activePhaseBtn: "bg-purple-900/40 border-purple-600/70 text-purple-200",
        accentText: "text-purple-400",
        grid1: 0x581c87,
        grid2: 0x2e1065,
      };
    }
    if (isCompanion) {
      return {
        cardBg:
          "border-emerald-900/30 bg-gradient-to-br from-emerald-950/15 via-neutral-900/95 to-neutral-950",
        viewportBg:
          "bg-gradient-to-b from-emerald-950/20 via-neutral-950 to-neutral-950",
        badgeBg: "bg-emerald-950/50 border-emerald-800/50 text-emerald-300",
        activeBtn: "bg-emerald-950/80 text-emerald-100 border-emerald-700/70",
        activePhaseBtn:
          "bg-emerald-900/40 border-emerald-600/70 text-emerald-200",
        accentText: "text-emerald-400",
        grid1: 0x064e3b,
        grid2: 0x022c22,
      };
    }
    return {
      cardBg:
        "border-blue-900/30 bg-gradient-to-br from-blue-950/15 via-neutral-900/95 to-neutral-950",
      viewportBg:
        "bg-gradient-to-b from-blue-950/20 via-neutral-950 to-neutral-950",
      badgeBg: "bg-blue-950/50 border-blue-800/50 text-blue-300",
      activeBtn: "bg-blue-950/80 text-blue-100 border-blue-700/70",
      activePhaseBtn: "bg-blue-900/40 border-blue-600/70 text-blue-200",
      accentText: "text-blue-400",
      grid1: 0x1e3a8a,
      grid2: 0x0f172a,
    };
  }, [isBoss, isHostile, isCompanion]);

  const activePhases: BossPhaseData[] = useMemo(() => {
    if (phases && phases.length > 0) {
      return phases.map((p, idx) => ({
        ...p,
        attacks:
          p.attacks ||
          (idx === 1
            ? phase2Attacks || getEntityDefaultAttacks(bossName, category, 2)
            : phase1Attacks || getEntityDefaultAttacks(bossName, category, 1)),
        model_3d_url:
          p.model_3d_url ||
          (idx === 0
            ? modelPath || "/models/toro_wither.gltf"
            : modelPathPhase2 ||
              modelPath ||
              "/models/toro_wither_terror.gltf"),
      }));
    }
    if (
      hpPhase2 ||
      modelPathPhase2 ||
      (phase2Attacks && phase2Attacks.length > 0)
    ) {
      return [
        {
          phase_number: 1,
          phase_name: "Fase I: Combate",
          model_3d_url: modelPath || "/models/toro_wither.gltf",
          hp,
          damage,
          attacks:
            phase1Attacks || getEntityDefaultAttacks(bossName, category, 1),
        },
        {
          phase_number: 2,
          phase_name: "Fase II: Despertar",
          model_3d_url: modelPathPhase2 || "/models/toro_wither_terror.gltf",
          hp: hpPhase2,
          damage: damagePhase2,
          attacks:
            phase2Attacks || getEntityDefaultAttacks(bossName, category, 2),
        },
      ];
    }
    return [
      {
        phase_number: 1,
        phase_name: "Estadísticas & Combate",
        model_3d_url: modelPath || "/models/toro_wither.gltf",
        hp,
        damage,
        attacks:
          phase1Attacks || getEntityDefaultAttacks(bossName, category, 1),
      },
    ];
  }, [
    phases,
    hpPhase2,
    modelPathPhase2,
    phase2Attacks,
    phase1Attacks,
    modelPath,
    hp,
    damage,
    damagePhase2,
    bossName,
    category,
  ]);

  const currentPhaseObj =
    activePhases.find((p) => p.phase_number === selectedPhase) ||
    activePhases[0];
  const activeModel =
    currentPhaseObj?.model_3d_url || modelPath || "/models/toro_wither.gltf";
  const activeAttacksList =
    currentPhaseObj?.attacks ||
    getEntityDefaultAttacks(bossName, category, selectedPhase);

  const [selectedAttack, setSelectedAttack] = useState<BossAttack | null>(
    activeAttacksList[0] || null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const activeMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const activeClipsRef = useRef<THREE.AnimationClip[]>([]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  // Sync selected attack when phase changes
  useEffect(() => {
    if (activeAttacksList && activeAttacksList.length > 0) {
      setSelectedAttack(activeAttacksList[0]);
    }
  }, [selectedPhase]);

  const switchPhase = (phaseNum: number) => {
    setSelectedPhase(phaseNum);
    const targetPhase =
      activePhases.find((p) => p.phase_number === phaseNum) || activePhases[0];
    if (targetPhase?.attacks && targetPhase.attacks.length > 0) {
      setSelectedAttack(targetPhase.attacks[0]);
    }
  };

  const triggerAttack = (attack: BossAttack) => {
    setSelectedAttack(attack);

    if (!activeMixerRef.current || !activeClipsRef.current.length) return;

    const clips = activeClipsRef.current;
    let targetClip: THREE.AnimationClip | undefined;

    if (attack.animation_clip) {
      const clipNameLower = attack.animation_clip.toLowerCase();
      targetClip =
        clips.find((c) => c.name.toLowerCase() === clipNameLower) ||
        clips.find((c) => c.name.toLowerCase().includes(clipNameLower));
    }

    if (!targetClip) {
      const searchTerms = [
        "attack",
        "bite",
        "claw",
        "shoot",
        "smash",
        "slam",
        "slash",
        "roar",
        "punch",
        "strike",
        "jump",
        "roll",
        "eat",
        "idle",
      ];
      for (const term of searchTerms) {
        targetClip = clips.find((c) => c.name.toLowerCase().includes(term));
        if (targetClip) break;
      }
    }

    if (targetClip && activeMixerRef.current) {
      try {
        if (currentActionRef.current) {
          currentActionRef.current.stop();
        }
        const action = activeMixerRef.current.clipAction(targetClip);
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
        currentActionRef.current = action;
      } catch (err) {
        console.warn("Failed to play attack clip:", err);
      }
    }
  };

  // Three.js Canvas Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-4, -2, -4);
    scene.add(backLight);

    // Soft Thematic Floor Grid
    const gridHelper = new THREE.GridHelper(
      3.5,
      10,
      themeStyles.grid1,
      themeStyles.grid2,
    );
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (activeMixerRef.current) {
        activeMixerRef.current.update(delta);
      }

      if (modelRef.current && !isDraggingRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Load GLTF Model
    setIsLoading(true);
    const loader = new GLTFLoader();
    const resolvedUrl = resolveAssetUrl(activeModel);

    loader.load(
      resolvedUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / (maxDim || 1);
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];
            mats.forEach((mat) => {
              if (mat.map) {
                mat.map.magFilter = THREE.NearestFilter;
                mat.map.minFilter = THREE.NearestFilter;
                mat.map.needsUpdate = true;
              }
              mat.side = THREE.DoubleSide;
            });
          }
        });

        activeClipsRef.current = gltf.animations || [];

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          activeMixerRef.current = mixer;

          const firstClip = gltf.animations[0];
          const action = mixer.clipAction(firstClip);
          action.play();
          currentActionRef.current = action;
        }

        scene.add(model);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.warn("Failed to load GLTF in WikiBoss3DCard:", error);
        setIsLoading(false);
      },
    );

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [activeModel, themeStyles]);

  // Mouse Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !modelRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    modelRef.current.rotation.y += deltaX * 0.01;
    modelRef.current.rotation.x += deltaY * 0.01;
    modelRef.current.rotation.x = Math.max(
      -0.5,
      Math.min(0.5, modelRef.current.rotation.x),
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!cardWrapperRef.current) return;
    if (!document.fullscreenElement) {
      cardWrapperRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div ref={cardWrapperRef} className="my-1 w-full">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl ${themeStyles.cardBg}`}
      >
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Interactive Viewport (Left Column) */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Visualizador 3D interactivo"
            className={`min-h-115 relative flex h-full w-full cursor-grab items-center justify-center overflow-hidden border-b border-white/5 active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r ${themeStyles.viewportBg}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isLoading && (
              <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Cargando 3D...
                </span>
              </div>
            )}

            <div
              ref={containerRef}
              className="absolute inset-0 z-10 h-full w-full"
            />

            {/* Phase Switcher Tabs on 3D viewport */}
            {activePhases.length > 1 && (
              <div className="absolute left-3 top-3 z-20 flex max-w-[85%] flex-wrap gap-2">
                {activePhases.map((phase) => (
                  <button
                    type="button"
                    key={`phase-tab-${phase.phase_number}`}
                    aria-pressed={selectedPhase === phase.phase_number}
                    onClick={(e) => {
                      e.stopPropagation();
                      switchPhase(phase.phase_number);
                    }}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      selectedPhase === phase.phase_number
                        ? themeStyles.activePhaseBtn
                        : "border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <Flame
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-neutral-400"
                    />
                    <span>
                      {phase.phase_name || `Fase ${phase.phase_number}`}
                    </span>
                    {phase.hp && (
                      <span className="font-mono text-[9px] tabular-nums text-neutral-500">
                        ({phase.hp})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Floating 3D Controls */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetView();
                }}
                aria-label="Reiniciar cámara 360°"
                className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                title="Reiniciar Cámara 360°"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                aria-label="Pantalla completa 3D"
                className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                title="Pantalla Completa 3D"
              >
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 z-20">
              <span className="rounded border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Arrastra para rotar 360°
              </span>
            </div>
          </div>

          {/* Combat Details, Attributes & Clean Attack Deck (Right Column) */}
          <div className="flex flex-col justify-between space-y-5 p-6 sm:p-7 lg:col-span-7">
            <div className="space-y-4">
              {/* Entity Badges & Title */}
              <div>
                <div
                  className={`mb-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${themeStyles.badgeBg}`}
                >
                  <Sparkles size={11} className={themeStyles.accentText} />
                  <span>
                    {threatLabel ||
                      subtitle ||
                      category.toUpperCase() ||
                      "ENTIDAD OFICIAL"}
                  </span>
                </div>

                <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  {bossName}{" "}
                  {currentPhaseObj.phase_name
                    ? `• ${currentPhaseObj.phase_name}`
                    : ""}
                </h2>

                {description && (
                  <div className="mt-2 space-y-1 text-xs font-normal leading-relaxed text-neutral-400 [&_strong]:text-white">
                    <ReactMarkdown>
                      {description.replace(/\\n/g, "\n")}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Stat Highlights Bar */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
                  <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    <Heart size={11} className={themeStyles.accentText} />{" "}
                    {hpLabel || "Salud"}
                  </div>
                  <div className="font-mono text-xs font-bold text-white">
                    {currentPhaseObj.hp || hp}
                  </div>
                </div>

                <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
                  <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    <Zap size={11} className={themeStyles.accentText} />{" "}
                    {damageLabel || "Ataque"}
                  </div>
                  <div className="truncate text-xs font-bold text-white">
                    {currentPhaseObj.damage || damage}
                  </div>
                </div>

                <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
                  <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    <Shield size={11} className="text-neutral-400" /> Armadura
                  </div>
                  <div className="truncate text-xs font-bold text-white">
                    {armor}
                  </div>
                </div>

                <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
                  <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                    <Compass size={11} className="text-neutral-400" />{" "}
                    {speedLabel || "Velocidad"}
                  </div>
                  <div className="font-mono text-xs font-bold text-white">
                    {speed}
                  </div>
                </div>
              </div>

              {/* ⚔️ ACTION & ATTACK DECK */}
              {activeAttacksList && activeAttacksList.length > 0 && (
                <div className="space-y-2.5 rounded-xl border border-white/5 bg-neutral-950/80 p-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-200">
                      <Swords size={14} className={themeStyles.accentText} />
                      <span>Habilidades & Animaciones 3D</span>
                    </div>
                    <span className="flex items-center gap-1 rounded border border-white/5 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                      <Play size={9} /> Prueba en 3D
                    </span>
                  </div>

                  {/* Action Trigger Buttons Grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeAttacksList.map((attack) => {
                      const isSelected = selectedAttack?.name === attack.name;
                      return (
                        <button
                          key={attack.name}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => triggerAttack(attack)}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isSelected
                              ? themeStyles.activeBtn
                              : "border-white/5 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
                          }`}
                        >
                          <span className="text-xs" aria-hidden="true">
                            ⚔️
                          </span>
                          <span>{attack.name}</span>
                          {attack.damage && (
                            <span className="py-0.2 rounded border border-white/5 bg-neutral-950 px-1 font-mono text-[9px] text-neutral-400">
                              {attack.type || "ATK"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Selected Attack Card */}
                  {selectedAttack && (
                    <div className="space-y-1 rounded-lg border border-white/5 bg-neutral-900 p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-bold text-white">
                          <Zap size={12} className={themeStyles.accentText} />{" "}
                          {selectedAttack.name}
                        </span>
                        <div className="flex gap-1.5">
                          <span className="py-0.2 rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[9px] font-bold uppercase text-neutral-300">
                            {selectedAttack.type}
                          </span>
                          <span className="py-0.2 rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[9px] font-bold text-neutral-200">
                            {selectedAttack.damage}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-normal leading-relaxed text-neutral-400">
                        {selectedAttack.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Location & Spawn Info */}
              <div className="space-y-1 rounded-xl border border-white/5 bg-neutral-950/70 p-3 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  <MapPin size={12} className={themeStyles.accentText} />{" "}
                  {locationLabel || "Ubicación & Método de Aparición"}
                </div>
                <p className="text-[11px] leading-normal text-neutral-400">
                  <strong className="text-neutral-200">Hábitat:</strong>{" "}
                  {location}
                </p>
                {spawnMethod && (
                  <p className="text-[11px] leading-normal text-neutral-400">
                    <strong className="text-neutral-200">Aparición:</strong>{" "}
                    {spawnMethod}
                  </p>
                )}
              </div>

              {/* Drops & Bounty */}
              {drops && drops.length > 0 && (
                <div>
                  <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <Award className="h-3.5 w-3.5 text-neutral-400" />{" "}
                    {dropsLabel || "Botín & Drops"}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {drops.map((drop) => (
                      <span
                        key={drop}
                        className="flex items-center gap-1.5 rounded-md border border-white/5 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                        {drop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* KilluCoins Bounty Bar */}
            {kcReward ? (
              <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Coins size={14} className="text-amber-400" />
                  <span>{bountyLabel || "Recompensa de Caza"}</span>
                </div>
                <span className="font-mono text-base font-bold text-amber-300">
                  +{kcReward.toLocaleString()} KC
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiBoss3DCard;
