import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaTrophy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { MEDAL_ICONS } from '../../utils/MedalIcons';

const API_URL = import.meta.env.VITE_API_URL;

interface Medal {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export default function GamificationManager() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<any>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [medals, setMedals] = useState<Medal[]>([]);
    const [prevMedalsStr, setPrevMedalsStr] = useState<string | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error);
    }, []);

    const onUpdate = async (key: string, newValue: string) => {
        setSaving(key);
        try {
            await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newValue })
            });
            setSettings((prev: any) => ({ ...prev, [key]: newValue }));
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    // Derived state pattern
    const medalsStr = settings?.medal_definitions ? (typeof settings.medal_definitions === 'string' ? settings.medal_definitions : JSON.stringify(settings.medal_definitions)) : null;

    if (medalsStr !== prevMedalsStr) {
        setPrevMedalsStr(medalsStr);
        if (medalsStr) {
            try {
                const parsed = JSON.parse(medalsStr);
                setMedals(Array.isArray(parsed) ? parsed : []);
            } catch { setMedals([]); }
        } else {
            setMedals([]);
        }
    }

    const handleAdd = () => {
        setMedals([...medals, { 
            id: Date.now(), 
            name: 'Nueva Medalla', 
            description: 'Descripción de la medalla...', 
            icon: 'FaMedal', 
            color: '#fbbf24' 
        }]);
    };

    const handleDelete = (id: number) => {
        if(!confirm('¿Borrar esta medalla?')) return;
        setMedals(medals.filter(m => m.id !== id));
    };

    const handleChange = (id: number, field: keyof Medal, value: string) => {
        setMedals(medals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = () => {
        onUpdate('medal_definitions', JSON.stringify(medals));
    };

    // Helper to render icon component dynamically
    const renderIcon = (iconName: string) => {
        const Icon = MEDAL_ICONS[iconName as keyof typeof MEDAL_ICONS] || MEDAL_ICONS.FaMedal;
        return <Icon />;
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaTrophy style={{ color: '#fbbf24' }} /> {t('admin.gamification.medals.title', 'Gestión de Medallas')}
                </h3>
                <button onClick={handleSave} className="btn-primary" disabled={saving === 'medal_definitions'}>
                    <FaSave /> {saving === 'medal_definitions' ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {medals.map((medal) => (
                    <div key={medal.id} style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: `1px solid ${medal.color}`,
                        borderRadius: '8px', 
                        padding: '1rem',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => handleDelete(medal.id)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                            <FaTrash />
                        </button>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Icon Preview & Color Picker */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ 
                                    fontSize: '2rem', 
                                    color: medal.color,
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 0 10px ${medal.color}40`
                                }}>
                                    {renderIcon(medal.icon)}
                                </div>
                                <input 
                                    type="color" 
                                    value={medal.color} 
                                    onChange={(e) => handleChange(medal.id, 'color', e.target.value)} 
                                    style={{ width: '40px', height: '25px', padding: 0, border: 'none', background: 'none' }}
                                />
                            </div>

                            {/* Info Inputs */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input 
                                    className="admin-input" 
                                    value={medal.name} 
                                    onChange={(e) => handleChange(medal.id, 'name', e.target.value)}
                                    placeholder="Nombre Medalla"
                                    style={{ fontWeight: 'bold' }}
                                />
                                <textarea 
                                    className="admin-input" 
                                    value={medal.description} 
                                    onChange={(e) => handleChange(medal.id, 'description', e.target.value)}
                                    placeholder="Descripción..."
                                    rows={2}
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        {/* Icon Selector */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
                            {Object.keys(MEDAL_ICONS).map(iconKey => (
                                <button 
                                    key={iconKey}
                                    onClick={() => handleChange(medal.id, 'icon', iconKey)}
                                    style={{
                                        background: medal.icon === iconKey ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                        color: medal.icon === iconKey ? '#000' : '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                    title={iconKey}
                                >
                                    {renderIcon(iconKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div 
                    onClick={handleAdd}
                    style={{ 
                        border: '2px dashed #444', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        padding: '2rem',
                        color: '#666',
                        minHeight: '200px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
                >
                    <FaPlus size={32} />
                    <span style={{ marginTop: '1rem', fontWeight: 'bold' }}>Crear Nueva Medalla</span>
                </div>
            </div>
        </div>
    );
}
