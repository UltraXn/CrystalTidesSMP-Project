import { useState } from 'react';
import { FaGavel, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Rule {
    id: number;
    title: string;
    description: string;
}

interface RulesEditorProps {
    settings: {
        server_rules?: string | Rule[];
    };
    onUpdate: (key: string, value: string) => void;
    saving: string | null;
}

// Initial mock rules if none exist
const DEFAULT_RULES: Rule[] = [
    { id: 1, title: 'Respeto Mutuo', description: 'Trata a todos los jugadores y staff con respeto. El acoso no es tolerado.' },
    { id: 2, title: 'No Hacks / Cheats', description: 'El uso de clientes modificados que den ventaja está prohibido.' },
    { id: 3, title: 'Griefing', description: 'Destruir construcciones de otros jugadores es sancionable.' }
];

export default function RulesEditor({ settings, onUpdate, saving }: RulesEditorProps) {
    const { t } = useTranslation();
    const [rules, setRules] = useState<Rule[]>([]);
    const [prevRulesStr, setPrevRulesStr] = useState<string | null>(null);

    // Pattern: Adjust state during render when props change
    const rulesStr = settings?.server_rules ? (typeof settings.server_rules === 'string' ? settings.server_rules : JSON.stringify(settings.server_rules)) : null;

    if (rulesStr !== prevRulesStr) {
        setPrevRulesStr(rulesStr);
        if (rulesStr) {
            try {
                const parsed = JSON.parse(rulesStr);
                setRules(Array.isArray(parsed) ? parsed : DEFAULT_RULES);
            } catch { setRules(DEFAULT_RULES); }
        } else {
            setRules(DEFAULT_RULES);
        }
    }

    const handleAdd = () => {
        const newRule = { id: Date.now(), title: '', description: '' };
        setRules([...rules, newRule]);
    };

    const handleDelete = (id: number) => {
        if(!window.confirm('¿Borrar esta regla?')) return;
        setRules(rules.filter(r => r.id !== id));
    };

    const handleChange = (id: number, field: keyof Rule, value: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = () => {
        onUpdate('server_rules', JSON.stringify(rules));
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaGavel /> {t('admin.settings.rules.title', 'Reglamento del Servidor')}
                </h3>
                <button onClick={handleSave} className="btn-primary" disabled={saving === 'server_rules'}>
                    <FaSave /> {saving === 'server_rules' ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rules.map((rule, index) => (
                    <div key={rule.id} style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid #333',
                        borderRadius: '8px', 
                        padding: '1rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input 
                                    className="admin-input" 
                                    value={rule.title} 
                                    onChange={(e) => handleChange(rule.id, 'title', e.target.value)}
                                    placeholder="Título de la Regla"
                                    style={{ fontWeight: 'bold' }}
                                />
                                <textarea 
                                    className="admin-input" 
                                    value={rule.description} 
                                    onChange={(e) => handleChange(rule.id, 'description', e.target.value)}
                                    placeholder="Descripción detallada..."
                                    rows={2}
                                />
                            </div>

                            <button 
                                onClick={() => handleDelete(rule.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleAdd} 
                className="btn-secondary" 
                style={{ marginTop: '1rem', width: '100%', border: '1px dashed #444', background: 'transparent' }}
            >
                <FaPlus /> Añadir Nueva Regla
            </button>
        </div>
    );
}
