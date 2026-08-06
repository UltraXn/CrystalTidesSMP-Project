import React from 'react';
import { WikiArticle } from '../../../../services/wikiService';

interface BossLabelsTabProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

export function BossLabelsTab({ formData, setFormData }: Readonly<BossLabelsTabProps>) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label htmlFor="card-theme-select" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Tema de Color Visual (Card Theme)</label>
                <select
                    id="card-theme-select"
                    value={formData.card_theme ?? 'red'}
                    onChange={e => setFormData({ ...formData, card_theme: e.target.value as 'red' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'slate' })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                >
                    <option value="red">🔴 Carmesí / Hostil (Rojo)</option>
                    <option value="emerald">🟢 Esmeralda / Mascota (Verde)</option>
                    <option value="amber">🟡 Ámbar / Mercader (Dorado)</option>
                    <option value="purple">🟣 Imperial / Mítico (Púrpura)</option>
                    <option value="cyan">🔵 Nether / Abisal (Cyan)</option>
                    <option value="slate">⚙️ Neutro / Sistema (Gris)</option>
                </select>
            </div>
            <div>
                <label htmlFor="threat-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 1 (Amenaza / Tipo)</label>
                <input
                    id="threat-label-input"
                    type="text"
                    value={formData.threat_label ?? ''}
                    onChange={e => setFormData({ ...formData, threat_label: e.target.value })}
                    placeholder="ej. NIVEL DE AMENAZA / TEMPERAMENTO / MONEDA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="hp-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 2 (Salud / Vida)</label>
                <input
                    id="hp-label-input"
                    type="text"
                    value={formData.hp_label ?? ''}
                    onChange={e => setFormData({ ...formData, hp_label: e.target.value })}
                    placeholder="ej. SALUD DE COMBATE / SALUD DE MASCOTA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="damage-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 3 (Ataque / Daño)</label>
                <input
                    id="damage-label-input"
                    type="text"
                    value={formData.damage_label ?? ''}
                    onChange={e => setFormData({ ...formData, damage_label: e.target.value })}
                    placeholder="ej. PODER DE DAÑO / ESPECIALIDAD DE TIENDA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="speed-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 4 (Velocidad / Marcha)</label>
                <input
                    id="speed-label-input"
                    type="text"
                    value={formData.speed_label ?? ''}
                    onChange={e => setFormData({ ...formData, speed_label: e.target.value })}
                    placeholder="ej. VELOCIDAD / MARCHA / AGILIDAD DE VUELO"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="location-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Hábitat / Ubicación</label>
                <input
                    id="location-label-input"
                    type="text"
                    value={formData.location_label ?? ''}
                    onChange={e => setFormData({ ...formData, location_label: e.target.value })}
                    placeholder="ej. UBICACIÓN & APARICIÓN / HÁBITAT NATURAL"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="drops-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Drops / Objetos</label>
                <input
                    id="drops-label-input"
                    type="text"
                    value={formData.drops_label ?? ''}
                    onChange={e => setFormData({ ...formData, drops_label: e.target.value })}
                    placeholder="ej. BOTÍN DE CAZA / CATÁLOGO DE MERCADO"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label htmlFor="bounty-label-input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Pie de Página (Recompensa)</label>
                <input
                    id="bounty-label-input"
                    type="text"
                    value={formData.bounty_label ?? ''}
                    onChange={e => setFormData({ ...formData, bounty_label: e.target.value })}
                    placeholder="ej. RECOMPENSA DE CAZA / RECOMPENSA IMPERIAL"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
    );
}
