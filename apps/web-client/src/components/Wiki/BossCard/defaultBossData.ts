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

export const PHASE_1_ATTACKS: BossAttack[] = [
  {
    name: 'Zarpaso fatal',
    type: 'MELEE',
    damage: '20 HP (Empuje + Combo)',
    description:
      'The Forgotten Terror arremete velozmente en el aire ejecutando una estocada frontal con sus garras de basalto y concreto.',
    animation_clip: 'claw2',
  },
  {
    name: 'Zarpaso doble',
    type: 'MELEE',
    damage: '35 HP Crítico',
    description: 'Golpe cruzado con ambas garras que inflige daño masivo y desgarra armaduras.',
    animation_clip: 'claw1',
  },
  {
    name: 'Casteo Wither',
    type: 'PROYECTIL',
    damage: '25 HP + Wither II',
    description:
      'Dispara una ráfaga de proyectiles de calaveras guiadas que persiguen a los jugadores cercanos.',
    animation_clip: 'shoot',
  },
  {
    name: 'Ciclón Wither',
    type: 'AOE',
    damage: '30 HP (Radio 14 Bloques)',
    description:
      'Giro ciclónico a gran velocidad que barre la arena y repele con fuerza gravitacional.',
    animation_clip: 'roundhouse',
  },
  {
    name: 'Quebranta armaduras',
    type: 'DEBUFF',
    damage: 'Ruptura de Escudos',
    description:
      'Ataque descendente contundente que desactiva los escudos y reduce la protección física.',
    animation_clip: 'overhead_swipe',
  },
  {
    name: 'Pozos Wither',
    type: 'INVOCACIÓN',
    damage: '15 HP/seg Ácido',
    description: 'Genera charcos de podredumbre oscura en el suelo que dañan de forma continua.',
    animation_clip: 'wither_pool',
  },
];

export const PHASE_2_ATTACKS: BossAttack[] = [
  {
    name: 'Impacto Aplastante de Terror',
    type: 'MELEE PESADO',
    damage: '45 HP Físico',
    description: 'Salto colosal con aplastamiento masivo en área con sus garras terrestres.',
    animation_clip: 'left_smash2',
  },
  {
    name: 'Barrido de Garras & Coletazo',
    type: 'AOE MELEE',
    damage: '35 HP Físico',
    description:
      'Giro circular rasante a nivel del suelo que barre a múltiples jugadores a la vez.',
    animation_clip: 'right_smash2',
  },
  {
    name: 'Erupción Declamatoria (Decapitación <300 HP)',
    type: 'DECAPITACIÓN',
    damage: '99% Resistencia Divina',
    description:
      'Se decapita a sí mismo arrancándose el cráneo para obtener invulnerabilidad y velocidad extrema.',
    animation_clip: 'head_off',
  },
  {
    name: 'Frenesí de Sombras (Cráneo en Mano)',
    type: 'PROYECTIL',
    damage: '50 HP Explosivo',
    description:
      'Blande su propia cabeza decapitada disparando rayos hiper-concentrados de energía abisal.',
    animation_clip: 'charge2',
  },
  {
    name: 'Giro de Cuchillas Óseas',
    type: 'AOE CONTINUO',
    damage: '40 HP Cortante',
    description: 'Rueda a toda velocidad por el campo de batalla desmembrando a su paso.',
    animation_clip: 'spin2',
  },
];

export function getEntityDefaultAttacks(
  bossName: string,
  category: string,
  selectedPhase: number,
): BossAttack[] {
  const nameLower = (bossName || '').toLowerCase();
  const catLower = (category || '').toLowerCase();

  if (nameLower.includes('wither') || nameLower.includes('terror')) {
    return selectedPhase === 2 ? PHASE_2_ATTACKS : PHASE_1_ATTACKS;
  }

  if (nameLower.includes('drake') || nameLower.includes('dragón') || nameLower.includes('dragon')) {
    return [
      {
        name: 'Mordisco Desgarrador',
        type: 'MELEE',
        damage: '25 HP Físico',
        description: 'Potente mordedura con fauces blindadas que causa sangrado severo.',
        animation_clip: 'bite',
      },
      {
        name: 'Aliento de Fuego Dracónico',
        type: 'AOE FUEGO',
        damage: '40 HP Ígneo',
        description:
          'Exhala una llamarada continua que calcina a todos los jugadores en un cono de 8 bloques.',
        animation_clip: 'breath',
      },
      {
        name: 'Coletazo de Torbellino',
        type: 'AOE EMPUJE',
        damage: '20 HP Físico',
        description: 'Giro violento con la cola que repele a los atacantes por la espalda.',
        animation_clip: 'tail',
      },
      {
        name: 'Rugido Primordial',
        type: 'DEBUFF',
        damage: 'Efecto Debilidad II',
        description: 'Grito intimidante que paraliza temporalmente a las víctimas cercanas.',
        animation_clip: 'roar',
      },
    ];
  }

  if (
    nameLower.includes('automaton') ||
    nameLower.includes('gólem') ||
    nameLower.includes('golem')
  ) {
    return [
      {
        name: 'Puño de Engranaje Pesado',
        type: 'MELEE',
        damage: '30 HP Físico',
        description: 'Golpe demoledor propulsado por vapor que abolla armaduras de diamante.',
        animation_clip: 'punch',
      },
      {
        name: 'Sobrecarga de Vapor Cinético',
        type: 'AOE',
        damage: '25 HP Térmico',
        description: 'Libera vapor a presión extrema que repele y ciega a los enemigos en área.',
        animation_clip: 'smash',
      },
      {
        name: 'Descarga Eléctrica de Núcleo',
        type: 'PROYECTIL',
        damage: '35 HP Rayo',
        description: 'Dispara un haz energético concentrado desde su pecho mecánico.',
        animation_clip: 'laser',
      },
      {
        name: 'Baluarte Fortificado',
        type: 'DEFENSA',
        damage: '80% Resistencia',
        description: 'Adopta una postura defensiva que reduce enormemente todo daño recibido.',
        animation_clip: 'guard',
      },
    ];
  }

  if (nameLower.includes('wendigo')) {
    return [
      {
        name: 'Desgarro de Furia Glacial',
        type: 'MELEE',
        damage: '35 HP Cortante',
        description: 'Zarpazos frenéticos capaces de penetrar escudos y causar congelación.',
        animation_clip: 'slash',
      },
      {
        name: 'Chillido de Hambruna',
        type: 'AOE MÁGICO',
        damage: 'Ceguera & Lentitud',
        description: 'Aullido aterrador que desorienta y frena a los cazadores en el bosque.',
        animation_clip: 'scream',
      },
      {
        name: 'Salto de Emboscada Nocturna',
        type: 'EMBESTIDA',
        damage: '30 HP Impacto',
        description: 'Salto acrobático desde las sombras para derribar a su presa.',
        animation_clip: 'leap',
      },
    ];
  }

  if (nameLower.includes('chupacabra')) {
    return [
      {
        name: 'Drenaje Vampírico',
        type: 'MELEE',
        damage: '20 HP (Roba Vida)',
        description: 'Muerde a la víctima drenando su vitalidad para curarse a sí mismo.',
        animation_clip: 'bite',
      },
      {
        name: 'Abalanzada Sombría',
        type: 'EMBESTIDA',
        damage: '18 HP Veloz',
        description: 'Acometida a gran velocidad esquivando ataques frontales.',
        animation_clip: 'jump',
      },
      {
        name: 'Mirada Intimidante',
        type: 'DEBUFF',
        damage: 'Náusea I',
        description: 'Fija sus ojos brillantes causando desorientación instantánea.',
        animation_clip: 'idle',
      },
    ];
  }

  if (nameLower.includes('chesed')) {
    return [
      {
        name: 'Falla Espacio-Temporal',
        type: 'AOE',
        damage: '45 HP Cinético',
        description: 'Distorsiona la gravedad atrayendo y aplastando a todos los objetivos.',
        animation_clip: 'slam',
      },
      {
        name: 'Descarga Cinética Radial',
        type: 'PROYECTIL',
        damage: '30 HP Eléctrico',
        description: 'Proyecta ondas de energía cinética de largo alcance.',
        animation_clip: 'shoot',
      },
    ];
  }

  if (nameLower.includes('geburah')) {
    return [
      {
        name: 'Tajo del Juicio Carmesí',
        type: 'MELEE',
        damage: '60 HP Sangrado',
        description: 'Corte demoledor de gran espada que ignora la protección de armadura.',
        animation_clip: 'slash',
      },
      {
        name: 'Lanza del Castigo Divino',
        type: 'PENETRACIÓN',
        damage: '50 HP Perforante',
        description: 'Estocada lineal hiper-sónica que atraviesa múltiples objetivos.',
        animation_clip: 'thrust',
      },
    ];
  }

  if (nameLower.includes('malkuth')) {
    return [
      {
        name: 'Erupción Elemental Ígnea',
        type: 'AOE',
        damage: '40 HP Fuego',
        description: 'Golpea el suelo desatando pilares de magma y fuego primordial.',
        animation_clip: 'erupt',
      },
      {
        name: 'Vórtice de Escarcha Abisal',
        type: 'AOE FRÍO',
        damage: '25 HP + Congelación',
        description: 'Onda expansiva congelante que inmoviliza a los enemigos.',
        animation_clip: 'freeze',
      },
    ];
  }

  if (
    catLower.includes('critters') ||
    catLower.includes('pacifico') ||
    catLower.includes('pacífico') ||
    catLower.includes('mascota') ||
    catLower.includes('fauna')
  ) {
    return [
      {
        name: 'Acariciar & Jugar',
        type: 'INTERACCIÓN',
        damage: 'Amistad +10',
        description: 'Interactúa con la criatura para aumentar su lealtad y felicidad.',
        animation_clip: 'interact',
      },
      {
        name: 'Truco / Mimetismo',
        type: 'HABILIDAD',
        damage: 'Evasión 100%',
        description: 'Realiza su pose característica y se camufla con el entorno.',
        animation_clip: 'roll',
      },
      {
        name: 'Comer Golosina',
        type: 'DOMESTICACIÓN',
        damage: 'Regeneración',
        description: 'Se alimenta de bayas o vegetación para restaurar su vitalidad.',
        animation_clip: 'eat',
      },
    ];
  }

  return [
    {
      name: 'Ataque de Combate',
      type: 'MELEE',
      damage: 'Ataque Físico',
      description: 'Ataque estándar de la criatura contra aventureros.',
      animation_clip: 'attack',
    },
  ];
}
