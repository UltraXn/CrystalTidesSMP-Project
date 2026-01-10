
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { Users, RefreshCw } from 'lucide-react';
import StaffCardComponent from '../StaffCard';
import { StaffCardData } from './StaffFormModal';

interface StaffListProps {
    cards: StaffCardData[];
    onlineStatus: Record<string, { mc: string, discord: string }>;
    onDragEnd: (result: DropResult) => void;
    onEdit: (card: StaffCardData) => void;
    onDelete: (id: string | number) => void;
    onSync?: () => void;
    onAdd?: () => void;
    syncing?: boolean;
}

export default function StaffList({ cards, onlineStatus, onDragEnd, onEdit, onDelete, onSync, onAdd, syncing = false }: StaffListProps) {
    const { t } = useTranslation();

    // Helper to duplicate PRESET logic or pass it down? 
    // Ideally we pass a helper or the badge URL directly. 
    // For now, I'll rely on a simple helper inside or simple logic.
    // The original code used a helper accessing PRESET_ROLES.
    // To keep this pure, I'll move the badge map here or assume the Card handles it if passed?
    // StaffCardComponent takes `roleBadge` as prop.
    
    const RANK_BADGES: Record<string, string> = {
        'Neroferno': '/ranks/rank-neroferno.png',
        'Killuwu': '/ranks/rank-killu.png',
        'Developer': '/ranks/developer.png',
        'Admin': '/ranks/admin.png',
        'Moderator': '/ranks/moderator.png',
        'Helper': '/ranks/helper.png',
        'Usuario': '/ranks/user.png',
        'Staff': '/ranks/staff.png'
    };

    const getRoleBadge = (role: string) => {
        return RANK_BADGES[role] || null;
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
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
                                                mc: onlineStatus[(card.mc_nickname || card.name).toLowerCase()]?.mc || 'offline',
                                                discord: onlineStatus[(card.mc_nickname || card.name).toLowerCase()]?.discord || 'offline'
                                            }}
                                            roleBadge={getRoleBadge(card.role)}
                                            onEdit={() => onEdit(card)}
                                            onDelete={() => onDelete(card.id)}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {cards.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.5 }}>
                    <Users size={48} style={{ marginBottom: '1rem' }} />
                    <p>{t('admin.staff.empty')}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button onClick={onSync} className="btn-secondary" disabled={syncing} style={{ minWidth: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                             {syncing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RefreshCw className="spin-icon" size={16} /> {t('admin.staff.syncing')}
                                </span>
                             ) : (
                                t('admin.staff.sync_btn')
                             )}
                        </button>
                        <button onClick={onAdd} className="btn-primary">{t('admin.staff.add_manual')}</button>
                    </div>
                </div>
            )}
        </>
    );
}
