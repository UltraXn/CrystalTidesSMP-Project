import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaTwitter, FaDiscord } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface StaffCard {
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    color: string;
    socials: { twitter: string; discord: string; youtube: string; };
}

export default function StaffCardsManager() {
    const { t } = useTranslation();
    const [cards, setCards] = useState<StaffCard[]>([]);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [formData, setFormData] = useState<StaffCard>({
        id: 0,
        name: '', // Initial placeholder
        role: 'Admin',
        description: '',
        image: '',
        color: '#fbbf24',
        socials: { twitter: '', discord: '', youtube: '' }
    });

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if(data.staff_cards) {
                    try {
                        const parsed = typeof data.staff_cards === 'string' ? JSON.parse(data.staff_cards) : data.staff_cards;
                        setCards(Array.isArray(parsed) ? parsed : []);
                    } catch { setCards([]); }
                }
            })
            .catch(console.warn);
    }, []);

    const handleSave = async (newCards: StaffCard[]) => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/settings/staff_cards`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: JSON.stringify(newCards) })
            });
            setCards(newCards);
        } catch (error) {
            console.error(error);
            alert("Error saving staff cards");
        } finally {
            setSaving(false);
        }
    };

    const handleAdd = () => {
        setEditingId('new');
        setFormData({
            id: Date.now(),
            name: '',
            role: 'Helper',
            description: '',
            image: '', // Use a default placeholder or empty
            color: '#3b82f6',
            socials: { twitter: '', discord: '', youtube: '' }
        });
    };

    const handleEdit = (card: StaffCard) => {
        setEditingId(card.id);
        setFormData({ ...card });
    };

    const handleDelete = (id: number) => {
        if(!confirm("¿Eliminar este perfil?")) return;
        const newCards = cards.filter(c => c.id !== id);
        handleSave(newCards);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newCards;
        if (editingId === 'new') {
            newCards = [...cards, { ...formData, id: Date.now() }];
        } else {
            newCards = cards.map(c => c.id === editingId ? formData : c);
        }
        handleSave(newCards);
        setEditingId(null);
    };

    const moveCard = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === cards.length - 1) return;
        
        const newCards = [...cards];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newCards[index], newCards[swapIndex]] = [newCards[swapIndex], newCards[index]];
        handleSave(newCards);
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaUsers style={{ color: '#fbbf24' }} /> {t('admin.staff.manager_title', 'Gestor de Staff')}
                </h3>
                <button onClick={handleAdd} className="btn-primary" disabled={!!editingId}>
                    <FaPlus /> Añadir Miembro
                </button>
            </div>

            {editingId && (
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid #444' }}>
                    <h4 style={{ margin: '0 0 1rem 0' }}>{editingId === 'new' ? 'Nuevo Perfil' : 'Editar Perfil'}</h4>
                    <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>Nombre (Nick)</label>
                            <input className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>Rol (Título)</label>
                            <input className="admin-input" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>Descripción / Bio</label>
                            <textarea className="admin-input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>Color del Rol</label>
                            <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ width:'100%', height:'40px', background:'none', border:'none' }} />
                        </div>
                        <div>
                             <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>Avatar URL (o Skin Name)</label>
                             <input className="admin-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://... o NickName" />
                             <p style={{ fontSize:'0.7rem', color:'#666', marginTop:'2px' }}>Si pones un nombre simple, se usará la cabeza de Minecraft.</p>
                        </div>
                        
                        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}><FaTwitter /> Twitter/X (Link)</label>
                                <input className="admin-input" value={formData.socials?.twitter || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, twitter: e.target.value}})} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}><FaDiscord /> Discord (User)</label>
                                <input className="admin-input" value={formData.socials?.discord || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, discord: e.target.value}})} />
                            </div>
                        </div>

                        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {cards.map((card, index) => (
                    <div key={card.id} style={{ 
                        background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)`, 
                        borderTop: `3px solid ${card.color}`,
                        borderRadius: '8px', 
                        padding: '1.5rem',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                             <button onClick={() => moveCard(index, 'up')} disabled={index === 0} style={{ background:'transparent', border:'none', color:'#666', cursor:'pointer' }}><FaArrowUp /></button>
                             <button onClick={() => moveCard(index, 'down')} disabled={index === cards.length - 1} style={{ background:'transparent', border:'none', color:'#666', cursor:'pointer' }}><FaArrowDown /></button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${card.color}` }}>
                                <img 
                                    src={card.image?.startsWith('http') ? card.image : `https://mc-heads.net/avatar/${card.image || card.name}/100`} 
                                    alt={card.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            </div>
                            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem' }}>{card.name}</h4>
                            <span style={{ color: card.color, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{card.role}</span>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: '#ccc', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                            {card.description || <i>Sin descripción</i>}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginBottom: '1rem' }}>
                            {card.socials?.twitter && <FaTwitter style={{ color: '#1DA1F2' }} />}
                            {card.socials?.discord && <FaDiscord style={{ color: '#5865F2' }} />}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(card)} style={{ flex: 1, padding: '0.5rem', background: '#333', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Editar</button>
                            <button onClick={() => handleDelete(card.id)} style={{ flex: 1, padding: '0.5rem', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
