const API_URL = import.meta.env.VITE_API_URL

export interface BossAttackConfig {
    name: string;
    type: string;
    damage: string;
    description: string;
    animation_clip?: string;
    variant_clips?: string[];
}

export interface BossPhase {
    phase_number: number;
    phase_name: string;
    model_3d_url?: string;
    hp?: string;
    damage?: string;
    attacks?: BossAttackConfig[];
    transition_clip?: string;
}

export const WIKI_CATEGORIES = [
    { id: 'mobs_hostiles', name: 'Mobs Hostiles', icon: '🔴', color: 'red' },
    { id: 'mobs_pacificos', name: 'Mobs Pacíficos / Domésticables', icon: '🟢', color: 'emerald' },
    { id: 'bosses', name: 'Bosses & Jefes Imperiales', icon: '🟣', color: 'purple' },
    { id: 'aquaculture', name: 'Aquaculture 2 (Vida Marina & Pesca)', icon: '🐟', color: 'cyan' },
    { id: 'mercaderes', name: 'Mercaderes & NPCs', icon: '🟡', color: 'amber' },
    { id: 'guias_generales', name: 'Guías Generales del Servidor', icon: '📘', color: 'blue' },
    { id: 'guias_items', name: 'Guías de Items & Equipamiento', icon: '🗡️', color: 'cyan' },
    { id: 'comandos', name: 'Comandos & Utilidades', icon: '⚡', color: 'slate' }
];

export function getCombinedCategories(articles: WikiArticle[]) {
    const predefinedIds = new Set(WIKI_CATEGORIES.map(c => c.id));
    const customCategories: { id: string; name: string; icon: string; color: string }[] = [];

    articles.forEach(art => {
        if (art.category && !predefinedIds.has(art.category)) {
            if (!customCategories.some(c => c.id === art.category)) {
                customCategories.push({
                    id: art.category,
                    name: art.category,
                    icon: '✨',
                    color: 'purple'
                });
            }
        }
    });

    return [...WIKI_CATEGORIES, ...customCategories];
}

export interface WikiArticle {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    description?: string;
    model_3d_url?: string;
    texture_url?: string;
    model_3d_url_phase_2?: string;
    boss_subtitle?: string;
    boss_entity_type?: string;
    boss_mod_name?: string;
    boss_tier?: string;
    boss_hp?: string;
    boss_hp_phase_2?: string;
    boss_damage?: string;
    boss_damage_phase_2?: string;
    boss_armor?: string;
    boss_speed?: string;
    boss_location?: string;
    boss_spawn_method?: string;
    boss_spawn_command?: string;
    boss_music_url?: string;
    boss_sound_spawn?: string;
    boss_immunities?: string[];
    boss_drops?: string[];
    boss_kc_reward?: number;
    boss_phases?: BossPhase[];
    boss_phase_1_attacks?: BossAttackConfig[];
    boss_phase_2_attacks?: BossAttackConfig[];
    
    // 🎨 Dynamic 100% DB Mutable UI Labels & Colors
    card_theme?: 'red' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'slate';
    threat_label?: string;
    hp_label?: string;
    damage_label?: string;
    speed_label?: string;
    location_label?: string;
    drops_label?: string;
    bounty_label?: string;

    author_id: string;
    created_at: string;
    updated_at: string;
}

export const getWikiArticles = async (category?: string): Promise<WikiArticle[]> => {
    const url = new URL(`${API_URL}/wiki`, window.location.origin);
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to fetch wiki articles')
    const data = await res.json()
    return data.data || data
}

export const getWikiArticle = async (slug: string): Promise<WikiArticle> => {
    const res = await fetch(`${API_URL}/wiki/${slug}`)
    if (!res.ok) throw new Error('Article not found')
    const data = await res.json()
    return data.data || data
}
