import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaPlus, FaCheckCircle, FaSync, FaTimes, FaDiscord, FaTwitch, FaTwitter, FaYoutube, FaSave } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Loader from "../UI/Loader";
import MinecraftAvatar from "../UI/MinecraftAvatar";
import { supabase } from '../../services/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

import StaffCardComponent, { StaffCardData as StaffCard } from './StaffCard';

interface ServerStaffUser {
    uuid?: string;
    web_id?: string | number;
    username: string;
    role: string;
    avatar_url?: string;
    discord?: { username: string };
    twitch?: { username: string };
}

const DEFAULT_STAFF = [
    {
        id: 1715001,
        name: 'Neroferno',
        role: 'Neroferno',
        description: 'Creador y Owner de CrystalTides.',
        image: 'Neroferno',
        color: '#8b5cf6',
        socials: { twitter: 'https://twitter.com/neroferno', discord: 'neroferno', youtube: '', twitch: 'neroferno' }
    },
    {
        id: 1715002,
        name: 'Killuwu',
        role: 'Killuwu',
        description: 'Administradora y Co-Owner.',
        image: 'Killuwu',
        color: '#0ea5e9', // Cyber Cyan
        socials: { twitter: '', discord: 'killuwu', youtube: '', twitch: '' }
    },
    {
        id: 1715003,
        name: 'Churlito',
        role: 'Developer',
        description: 'Desarrollador Full Stack.',
        image: 'Churlito',
        color: '#ec4899', // Hot Pink
        socials: { twitter: '', discord: 'churlito', youtube: '', twitch: '' }
    }
];

export default function StaffCardsManager() {
    const { t } = useTranslation();
    const [cards, setCards] = useState<StaffCard[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    
    // Sync Modal State
    const [showSyncModal, setShowSyncModal] = useState(false);

    const [foundStaff, setFoundStaff] = useState<StaffCard[]>([]);

    // Online Status State
    const [onlineStaff, setOnlineStaff] = useState<Record<string, { mc: string, discord: string }>>({});

    // Form State
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [formData, setFormData] = useState<StaffCard>({
        id: 0,
        name: '',
        mc_nickname: '',
        role: 'Usuario',
        description: '',
        image: '',
        color: '#9ca3af',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    });

    const PRESET_ROLES = useMemo(() => [
        { value: 'Neroferno', label: t('admin.staff.roles.neroferno'), color: '#8b5cf6', badge: '/ranks/rank-neroferno.png' },
        { value: 'Killuwu', label: t('admin.staff.roles.killuwu'), color: '#0ea5e9', badge: '/ranks/rank-killu.png' },
        { value: 'Developer', label: t('admin.staff.roles.developer'), color: '#ec4899', badge: '/ranks/developer.png' },
        { value: 'Admin', label: t('admin.staff.roles.admin'), color: '#ef4444', badge: '/ranks/admin.png' },
        { value: 'Moderator', label: t('admin.staff.roles.moderator'), color: '#21cb20', badge: '/ranks/moderator.png' },
        { value: 'Helper', label: t('admin.staff.roles.helper'), color: '#6bfa16', badge: '/ranks/helper.png' },
        { value: 'Staff', label: 'Staff', color: '#89c606', badge: '/ranks/staff.png' },
        { value: 'Usuario', label: t('admin.staff.roles.user'), color: '#db7700', badge: '/ranks/user.png' },
        { value: 'Custom', label: t('admin.staff.roles.custom'), color: '#ffffff', badge: null }
    ], [t]);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                const rawCards = data.staff_cards || (data.data?.staff_cards); 
                
                if(rawCards && rawCards !== "[]") {
                    try {
                        const parsed = typeof rawCards === 'string' ? JSON.parse(rawCards) : rawCards;
                        setCards(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF);
                    } catch { 
                        setCards(DEFAULT_STAFF); 
                    }
                } else {
                    setCards(DEFAULT_STAFF);
                }
            })
            .catch(() => setCards(DEFAULT_STAFF))
            .finally(() => setLoading(false));

        // Initial Online Check
        fetchOnlineStatus();
        
        // Poll every 60s
        const interval = setInterval(fetchOnlineStatus, 60000);
        return () => clearInterval(interval);
    }, []);


    const fetchOnlineStatus = () => {
        fetch(`${API_URL}/server/staff`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if(Array.isArray(data)) {
                    const statusMap: Record<string, { mc: string, discord: string }> = {};
                    data.forEach((u: any) => {
                        statusMap[u.username.toLowerCase()] = {
                            mc: u.mc_status || 'offline',
                            discord: u.discord_status || 'offline'
                        };
                    });
                    setOnlineStaff(statusMap);
                }
            })
            .catch(err => console.error("Error fetching online staff:", err));
    };

    const handleSave = async (newCards: StaffCard[]) => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/settings/staff_cards`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ value: JSON.stringify(newCards) })
            });

            if (!res.ok) throw new Error('Failed to save');
            setCards(newCards);
        } catch (error) {
            console.error(error);
            alert(t('admin.staff.save_error'));
        } finally {
            setSaving(false);
        }
    };

    const startSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/server/all-staff`);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Error ${res.status}: ${errText.substring(0, 100)}`); // Show first 100 chars
            }
            const json = await res.json();
            const staffUsers = json.data || [];
            
            if (staffUsers.length === 0) {
                alert(t('admin.staff.sync_no_users'));
                setSyncing(false);
                return;
            }

            // Transform for Preview
            const mappedStaff = staffUsers.map((u: ServerStaffUser) => {
                const existing = cards.find(c => c.name.toLowerCase() === u.username.toLowerCase());
                const roleConfig = PRESET_ROLES.find(r => r.value.toLowerCase() === u.role.toLowerCase());
                
                // Use backend role directly but prioritize preset case
                const finalRole = roleConfig ? roleConfig.value : u.role;
                
                return {
                    id: u.uuid || u.web_id || Date.now(),
                    name: u.username,
                    role: finalRole,
                    description: existing?.description || t('admin.staff.default_desc'),
                    image: u.avatar_url || (existing?.image?.startsWith('http') ? existing.image : u.username),
                    color: roleConfig?.color || '#fff',
                    socials: {
                        twitter: existing?.socials?.twitter || '',
                        discord: u.discord?.username || existing?.socials?.discord || '',
                        twitch: u.twitch?.username || existing?.socials?.twitch || '',
                        youtube: existing?.socials?.youtube || ''
                    },
                    isNew: !existing
                };
            });

            setFoundStaff(mappedStaff);
            setShowSyncModal(true);
        } catch (error) {
            console.error("Sync error:", error);
            const msg = error instanceof Error ? error.message : "Desconocido";
            alert(`${t('admin.staff.sync_error')} ${msg}`);
        } finally {
            setSyncing(false);
        }
    };

    const confirmSync = async () => {
        await handleSave(foundStaff);
        setShowSyncModal(false);
    };

    const handleAdd = () => {
        setEditingId('new');
        setFormData({
            id: Date.now(),
            name: '',
            role: 'Usuario',
            description: '',
            image: '',
            color: '#db7700',
            socials: { twitter: '', discord: '', youtube: '', twitch: '' }
        });
    };

    const handleEdit = (card: StaffCard) => {
        setEditingId(card.id);
        setFormData({ ...card });
    };

    const handleDelete = (id: number | string) => {
        if(!confirm(t('admin.staff.confirm_delete_profile'))) return;
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

    const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = PRESET_ROLES.find(r => r.value === e.target.value);
        if (selectedRole) {
            setFormData(prev => ({
                ...prev,
                role: selectedRole.value === 'Custom' ? '' : selectedRole.value,
                color: selectedRole.value === 'Custom' ? prev.color : selectedRole.color
            }));
        } else {
             setFormData(prev => ({ ...prev, role: e.target.value }));
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        setCards(items);
        handleSave(items);
    };

    // Helper to get badge
    const getRoleBadge = (roleName: string) => {
        const role = PRESET_ROLES.find(r => r.value === roleName);
        return role?.badge;
    };

    if (loading) {
        return (
            <div style={{ padding: '6rem 0' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="staff-manager-container">
            {/* Sync Modal GUI - Redesigned */}
            {showSyncModal && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content">
                        {/* Decorative Top Line */}
                        <div className="modal-accent-line"></div>

                        <div className="sync-modal-header">
                            <div className="sync-modal-icon">
                                <FaUsers />
                            </div>
                            <h3>{t('admin.staff.confirm_modal.title')}</h3>
                            <p>
                                <span dangerouslySetInnerHTML={{ __html: t('admin.staff.confirm_modal.detected_msg', { count: foundStaff.length, interpolation: { escapeValue: false } }) }}></span> <br/>
                                <span className="warning-text">{t('admin.staff.confirm_modal.warning')}</span>
                            </p>
                        </div>

                        <div className="sync-list-container">
                            {foundStaff.map((s, i) => (
                                <div key={i} className="sync-item-row">
                                    <div className="sync-avatar-status">
                                        <img 
                                            src={s.image?.startsWith('http') ? s.image : `https://mc-heads.net/avatar/${s.name}/56`}
                                            onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/MHF_Steve/56`}
                                            alt={s.name}
                                        />
                                        <div className="status-dot-mini"></div>
                                    </div>
                                    
                                    <div className="sync-item-info">
                                        <div className="sync-item-name">{s.name}</div>
                                        <div className="staff-role-badge" style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}20` }}>
                                            {s.role}
                                        </div>
                                    </div>

                                    <div className="sync-socials-preview">
                                        {s.socials.discord && <div title={s.socials.discord} className="social-pill discord"><FaDiscord size={14} /></div>} 
                                        {s.socials.twitch && <div title={s.socials.twitch} className="social-pill twitch"><FaTwitch size={14} /></div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer-premium">
                            <button 
                                onClick={() => setShowSyncModal(false)} 
                                className="modal-btn-secondary"
                            >
                                {t('admin.staff.confirm_modal.cancel')}
                            </button>
                            <button 
                                onClick={confirmSync} 
                                className="modal-btn-primary" 
                            >
                                <FaCheckCircle style={{ marginRight: '8px' }} /> {t('admin.staff.confirm_modal.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="staff-manager-header">
                <h3>
                    <FaUsers style={{ color: '#fbbf24' }} /> {t('admin.staff.manager_title')}
                </h3>
                {!editingId && (
                    <div className="staff-header-actions">
                        <button onClick={startSync} className="btn-secondary" disabled={syncing}>
                             {syncing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaSync className="spin-icon" /> {t('admin.staff.syncing')}
                                </span>
                             ) : (
                                <><FaSync style={{ marginRight: '5px' }} /> {t('admin.staff.sync_btn')}</>
                             )}
                        </button>
                        <button onClick={handleAdd} className="btn-primary">
                            <FaPlus size={12} style={{ marginRight: '5px' }} /> {t('admin.staff.add_member')}
                        </button>
                    </div>
                )}
            </div>

            {editingId && (
                <div className="staff-form-container">
                    <div className="staff-form-header">
                         <h4>
                            {editingId === 'new' ? t('admin.staff.form.new_title') : t('admin.staff.form.edit_title')}
                            {formData.name && <span className="preview-label">- {formData.name}</span>}
                         </h4>
                         <button onClick={() => setEditingId(null)} className="btn-close-mini"><FaTimes /></button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="staff-form-grid">
                        
                        {/* Left Column: Preview & Avatar */}
                        <div className="staff-form-preview">
                            <div className="staff-avatar-ring" style={{ borderColor: formData.color, boxShadow: `0 0 30px ${formData.color}30` }}>
                                <div className="staff-avatar-content">
                                    <MinecraftAvatar 
                                        src={formData.image || formData.mc_nickname || formData.name} 
                                        alt="Preview" 
                                        size={120}
                                    />
                                </div>
                            </div>
                            <div className="staff-preview-info">
                                <div className="preview-name">{formData.name || t('admin.staff.form.preview_name')}</div>
                                {getRoleBadge(formData.role) ? (
                                    <div className="preview-badge-wrapper">
                                        <img src={getRoleBadge(formData.role) || undefined} alt={formData.role} />
                                    </div>
                                ) : (
                                    <div className="staff-role-badge" style={{ color: formData.color, background: `${formData.color}15` }}>
                                        {formData.role || t('admin.staff.form.preview_role')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Inputs */}
                        <div className="staff-form-inputs">
                            <div className="full-width">
                                <label className="admin-label-premium">{t('admin.staff.form.name_label')}</label>
                                <input 
                                    className="admin-input-premium" 
                                    required 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder={t('admin.staff.form.name_ph')}
                                />
                            </div>

                            <div className="full-width">
                                <label className="admin-label-premium">Nick MC (Opcional - Para Skin/Status)</label>
                                <input 
                                    className="admin-input-premium" 
                                    value={formData.mc_nickname || ''} 
                                    onChange={e => setFormData({...formData, mc_nickname: e.target.value})} 
                                    placeholder="Ej: Neroferno (Dejar vacío si es igual al nombre)"
                                />
                            </div>

                            <div>
                                <label className="admin-label-premium">{t('admin.staff.form.role_label')}</label>
                                <select 
                                    className="admin-select-premium" 
                                    value={PRESET_ROLES.some(r => r.value === formData.role) ? formData.role : 'Custom'} 
                                    onChange={onRoleChange}
                                >
                                    {PRESET_ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                {!PRESET_ROLES.some(r => r.value === formData.role && r.value !== 'Custom') && (
                                    <input 
                                        className="admin-input-premium" 
                                        style={{ marginTop: '0.5rem' }}
                                        value={formData.role} 
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                        placeholder={t('admin.staff.form.custom_role_ph')}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="admin-label-premium">{t('admin.staff.form.color_label')}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input 
                                            type="color" 
                                            value={formData.color} 
                                            onChange={e => setFormData({...formData, color: e.target.value})} 
                                            style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', border: 'none' }} 
                                        />
                                    </div>
                                    <span style={{ color: '#aaa', fontFamily: 'monospace', fontWeight: '800' }}>{formData.color.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="full-width">
                                <label className="admin-label-premium">{t('admin.staff.form.avatar_label')}</label>
                                <input 
                                    className="admin-input-premium" 
                                    value={formData.image} 
                                    onChange={e => setFormData({...formData, image: e.target.value})} 
                                    placeholder={t('admin.staff.form.avatar_ph', "Nick de Minecraft o URL de imagen")} 
                                />
                                <div className="input-tip-premium">
                                    {t('admin.staff.avatar_tip', 'Usa un Nickname (Premium) o una URL directa al avatar/cabeza.')}
                                </div>
                            </div>

                            <div className="full-width">
                                <label className="admin-label-premium">{t('admin.staff.form.bio_label')}</label>
                                <textarea 
                                    className="admin-textarea-premium" 
                                    rows={3} 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder={t('admin.staff.form.bio_ph')}
                                />
                            </div>
                            
                            <div>
                                <label className="admin-label-premium"><FaDiscord /> Discord (User/IDs)</label>
                                <input className="admin-input-premium" value={formData.socials?.discord || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, discord: e.target.value}})} placeholder="Usuario o IDs" />
                            </div>
                            <div>
                                <label className="admin-label-premium"><FaTwitch /> Twitch (User)</label>
                                <input className="admin-input-premium" value={formData.socials?.twitch || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, twitch: e.target.value}})} placeholder="twitch.tv/..." />
                            </div>
                            <div>
                                <label className="admin-label-premium"><FaTwitter /> Twitter (Link)</label>
                                <input className="admin-input-premium" value={formData.socials?.twitter || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, twitter: e.target.value}})} placeholder="https://x.com/..." />
                            </div>
                            <div>
                                <label className="admin-label-premium"><FaYoutube /> YouTube (Link)</label>
                                <input className="admin-input-premium" value={formData.socials?.youtube || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, youtube: e.target.value}})} placeholder="https://youtube.com/..." />
                            </div>

                            <div className="staff-form-footer">
                                <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>{t('admin.staff.form.cancel')}</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? <Loader style={{ width: '20px', height: '20px' }} /> : <><FaSave style={{ marginRight: '8px' }} /> {t('admin.staff.form.save_changes')}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="staff-cards" direction="horizontal">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="staff-cards-grid"
                        >
                            {cards.map((card, index) => (
                                <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                                    {(provided) => (
                                        <StaffCardComponent 
                                            innerRef={provided.innerRef}
                                            draggableProps={provided.draggableProps}
                                            dragHandleProps={provided.dragHandleProps}
                                            style={provided.draggableProps.style}
                                            data={card}
                                            status={{
                                                mc: onlineStaff[(card.mc_nickname || card.name).toLowerCase()]?.mc || 'offline',
                                                discord: onlineStaff[(card.mc_nickname || card.name).toLowerCase()]?.discord || 'offline'
                                            }}
                                            roleBadge={getRoleBadge(card.role)}
                                            onEdit={() => handleEdit(card)}
                                            onDelete={() => handleDelete(card.id)}
                                            t={t}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {cards.length === 0 && !editingId && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.5 }}>
                    <FaUsers size={48} style={{ marginBottom: '1rem' }} />
                    <p>{t('admin.staff.empty')}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button onClick={startSync} className="btn-secondary" disabled={syncing} style={{ minWidth: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                             {syncing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaSync className="spin-icon" /> {t('admin.staff.syncing')}
                                </span>
                             ) : (
                                t('admin.staff.sync_btn')
                             )}
                        </button>
                        <button onClick={handleAdd} className="btn-primary">{t('admin.staff.add_manual')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
