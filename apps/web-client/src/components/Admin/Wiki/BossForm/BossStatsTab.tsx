import React from 'react';
import { WikiArticle } from '../../../../services/wikiService';

interface BossStatsTabProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

export function BossStatsTab({ formData, setFormData }: Readonly<BossStatsTabProps>) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_hp_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Salud Fase 1 (HP)</label>
                    <input
                        id="boss_hp_input"
                        type="text"
                        value={formData.boss_hp ?? ''}
                        onChange={e => setFormData({ ...formData, boss_hp: e.target.value })}
                        placeholder="600 HP"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_hp_phase_2_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Salud Fase 2 (Enfurecido)</label>
                    <input
                        id="boss_hp_phase_2_input"
                        type="text"
                        value={formData.boss_hp_phase_2 ?? ''}
                        onChange={e => setFormData({ ...formData, boss_hp_phase_2: e.target.value })}
                        placeholder="800 HP (DarkenSky Activo)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_damage_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Daño Base Fase 1</label>
                    <input
                        id="boss_damage_input"
                        type="text"
                        value={formData.boss_damage ?? ''}
                        onChange={e => setFormData({ ...formData, boss_damage: e.target.value })}
                        placeholder="35 (Efecto Wither)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_damage_phase_2_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Daño Crítico Fase 2</label>
                    <input
                        id="boss_damage_phase_2_input"
                        type="text"
                        value={formData.boss_damage_phase_2 ?? ''}
                        onChange={e => setFormData({ ...formData, boss_damage_phase_2: e.target.value })}
                        placeholder="50 Daño Crítico"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_armor_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Resistencia / Escudo Knockback</label>
                    <input
                        id="boss_armor_input"
                        type="text"
                        value={formData.boss_armor ?? ''}
                        onChange={e => setFormData({ ...formData, boss_armor: e.target.value })}
                        placeholder="1.0 Resistencia al Empuje"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_speed_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Velocidad & Rango de Agresión</label>
                    <input
                        id="boss_speed_input"
                        type="text"
                        value={formData.boss_speed ?? ''}
                        onChange={e => setFormData({ ...formData, boss_speed: e.target.value })}
                        placeholder="MovementSpeed 0.2 (Rango 64)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="boss_immunities_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Inmunidades & Protecciones Especiales (separadas por comas)</label>
                <input
                    id="boss_immunities_input"
                    type="text"
                    value={Array.isArray(formData.boss_immunities) ? formData.boss_immunities.join(', ') : (formData.boss_immunities ?? '')}
                    onChange={e => setFormData({ ...formData, boss_immunities: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Inmune a Proyectiles (Fase 2), Inmune a Fuego, Resistencia a Magia"
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
    );
}
