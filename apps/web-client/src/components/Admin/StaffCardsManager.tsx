import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers } from 'react-icons/fa';
import { DropResult } from '@hello-pangea/dnd';
import Loader from "../UI/Loader";
import { supabase } from '../../services/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

import { StaffCardData as StaffCard } from './Staff/StaffFormModal';
import StaffFormModal from './Staff/StaffFormModal';
import StaffList from './Staff/StaffList';
import StaffSyncModal from './Staff/StaffSyncModal';

interface ServerStaffUser {
    uuid?: string;
    web_id?: string | number;
    username: string;
    role: string;
    avatar_url?: string;
    discord?: { username: string };
    twitch?: { username: string };
}

// Mock Data Removed

// Mock Interfaces
interface MockStaffCardsManagerProps {
    mockCards?: StaffCard[];
    mockOnlineStatus?: Record<string, { mc: string, discord: string }>;
}

export default function StaffCardsManager({ mockCards, mockOnlineStatus }: MockStaffCardsManagerProps = {}) {
    const { t } = useTranslation();
    const [cards, setCards] = useState<StaffCard[]>(mockCards || []);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!mockCards);
    const [syncing, setSyncing] = useState(false);
    
    // Sync Modal State
    const [showSyncModal, setShowSyncModal] = useState(false);

    const [foundStaff, setFoundStaff] = useState<StaffCard[]>([]);

    // Online Status State
    const [onlineStaff, setOnlineStaff] = useState<Record<string, { mc: string, discord: string }>>(mockOnlineStatus || {});

    // Form State
    const [editingCard, setEditingCard] = useState<StaffCard | null>(null);
    const [isNew, setIsNew] = useState(false);

    const PRESET_ROLES = useMemo(() => [
        { value: 'Neroferno', label: t('admin.staff.roles.neroferno'), color: '#8b5cf6' },
        { value: 'Killuwu', label: t('admin.staff.roles.killuwu'), color: '#0ea5e9' },
        { value: 'Developer', label: t('admin.staff.roles.developer'), color: '#ec4899' },
        { value: 'Admin', label: t('admin.staff.roles.admin'), color: '#ef4444' },
        { value: 'Moderator', label: t('admin.staff.roles.moderator'), color: '#21cb20' },
        { value: 'Helper', label: t('admin.staff.roles.helper'), color: '#6bfa16' },
        { value: 'Staff', label: 'Staff', color: '#89c606' },
        { value: 'Usuario', label: t('admin.staff.roles.user'), color: '#db7700' },
        { value: 'Custom', label: t('admin.staff.roles.custom'), color: '#ffffff' }
    ], [t]);

    useEffect(() => {
        if (mockCards) {
            setLoading(false);
            return;
        }

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
                        setCards(Array.isArray(parsed) && parsed.length > 0 ? parsed : []);
                    } catch { 
                        setCards([]); 
                    }
                } else {
                    setCards([]);
                }
            })
            .catch(() => setCards([]))
            .finally(() => setLoading(false));

        // Initial Online Check
        if (!mockOnlineStatus) {
            fetchOnlineStatus();
            
            // Poll every 60s
            const interval = setInterval(fetchOnlineStatus, 60000);
            return () => clearInterval(interval);
        }
    }, [mockCards, mockOnlineStatus]);


    const fetchOnlineStatus = () => {
        if (mockOnlineStatus) return;
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
        setEditingCard(null); 
        setIsNew(true);
    };

    const handleEdit = (card: StaffCard) => {
        setEditingCard(card);
        setIsNew(false);
    };

    const handleDelete = (id: number | string) => {
        if(!confirm(t('admin.staff.confirm_delete_profile'))) return;
        const newCards = cards.filter(c => c.id !== id);
        handleSave(newCards);
    };

    const handleFormSave = (formData: StaffCard) => {
        let newCards;
        if (isNew) {
            newCards = [...cards, { ...formData, id: Date.now() }];
        } else {
            newCards = cards.map(c => c.id === formData.id ? formData : c);
        }
        handleSave(newCards);
        setEditingCard(null);
        setIsNew(false);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        setCards(items);
        handleSave(items);
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
            <StaffSyncModal 
                isOpen={showSyncModal}
                foundStaff={foundStaff}
                onClose={() => setShowSyncModal(false)}
                onConfirm={confirmSync}
            />

            <div className="staff-manager-header">
                <h3>
                    <FaUsers style={{ color: '#fbbf24' }} /> {t('admin.staff.manager_title')}
                </h3>
                {(!editingCard && !isNew) && (
                    <div className="staff-header-actions">
                        {/* Sync Button Logic handled by StaffList buttons if empty, or here if not empty? 
                            The original design had header actions. I will keep them here for consistency 
                            if the list is not empty.
                        */}
                    </div>
                )}
            </div>

            {(editingCard || isNew) && (
                <StaffFormModal 
                    userData={editingCard}
                    isNew={isNew}
                    onClose={() => { setEditingCard(null); setIsNew(false); }}
                    onSave={handleFormSave}
                    saving={saving}
                />
            )}

            {!editingCard && !isNew && (
                <StaffList 
                    cards={cards} 
                    onlineStatus={onlineStaff}
                    onDragEnd={handleDragEnd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSync={startSync}
                    onAdd={handleAdd}
                    syncing={syncing}
                />
            )}
        </div>
    );
}
