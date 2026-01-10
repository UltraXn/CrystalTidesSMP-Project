import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { DropResult } from '@hello-pangea/dnd';
import Loader from "../UI/Loader";
import { StaffCardData as StaffCard } from './Staff/StaffFormModal';
import StaffFormModal from './Staff/StaffFormModal';
import StaffList from './Staff/StaffList';
import StaffSyncModal from './Staff/StaffSyncModal';
import { 
    useAdminSettings, 
    useUpdateSiteSetting,
    useStaffOnlineStatus
} from '../../hooks/useAdminData';

interface ServerStaffUser {
    uuid?: string;
    web_id?: string | number;
    username: string;
    role: string;
    avatar_url?: string;
    discord?: { username: string };
    twitch?: { username: string };
}

interface StaffCardsManagerProps {
    mockCards?: StaffCard[];
    mockOnlineStatus?: Record<string, { mc: string, discord: string }>;
}

export default function StaffCardsManager({ mockCards, mockOnlineStatus }: StaffCardsManagerProps = {}) {
    const { t } = useTranslation();
    
    // TanStack Query Hooks
    const { data: adminSettings, isLoading: loading } = useAdminSettings();
    const { data: onlineStaff = {} } = useStaffOnlineStatus();
    const updateSettingMutation = useUpdateSiteSetting();

    const cards = mockCards || adminSettings?.staff || [];
    
    // UI State
    const [syncing, setSyncing] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [foundStaff, setFoundStaff] = useState<StaffCard[]>([]);

    // Form State
    const [editingCard, setEditingCard] = useState<StaffCard | null>(null);
    const [isNew, setIsNew] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

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

    const handleSaveList = async (newList: StaffCard[]) => {
        updateSettingMutation.mutate({
            key: 'staff_cards',
            value: JSON.stringify(newList)
        });
    };

    const startSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/users/staff`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const staffUsers = json.data || [];
            
            if (staffUsers.length === 0) {
                alert(t('admin.staff.sync_no_users'));
                return;
            }

            const mappedStaff = staffUsers.map((u: ServerStaffUser) => {
                const existing = cards.find((c: StaffCard) => c.name.toLowerCase() === u.username.toLowerCase());
                const roleConfig = PRESET_ROLES.find(r => r.value.toLowerCase() === u.role.toLowerCase());
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
            alert(t('admin.staff.sync_error'));
        } finally {
            setSyncing(false);
        }
    };

    const confirmSync = async () => {
        await handleSaveList(foundStaff);
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
        const newCards = cards.filter((c: StaffCard) => c.id !== id);
        handleSaveList(newCards);
    };

    const handleFormSave = (formData: StaffCard) => {
        let newCards;
        if (isNew) {
            newCards = [...cards, { ...formData, id: Date.now() }];
        } else {
            newCards = cards.map((c: StaffCard) => c.id === formData.id ? formData : c);
        }
        handleSaveList(newCards);
        setEditingCard(null);
        setIsNew(false);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        handleSaveList(items);
    };

    if (loading) return <div style={{ padding: '6rem 0' }}><Loader /></div>;

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
                    <Users style={{ color: '#fbbf24' }} /> {t('admin.staff.manager_title')}
                </h3>
            </div>

            {(editingCard || isNew) && (
                <StaffFormModal 
                    userData={editingCard}
                    isNew={isNew}
                    onClose={() => { setEditingCard(null); setIsNew(false); }}
                    onSave={handleFormSave}
                    saving={updateSettingMutation.isPending}
                />
            )}

            {!editingCard && !isNew && (
                <StaffList 
                    cards={cards} 
                    onlineStatus={mockOnlineStatus || onlineStaff}
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
