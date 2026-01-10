
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Crown, GripVertical, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Donor } from './DonorFormModal';

interface DonorsListProps {
    donors: Donor[];
    onDragEnd: (result: DropResult) => void;
    onEdit: (donor: Donor) => void;
    onDelete: (id: string) => void;
    onImport: () => void;
}

export default function DonorsList({ donors, onDragEnd, onEdit, onDelete, onImport }: DonorsListProps) {
    const { t } = useTranslation();

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="donors-list">
                {(provided) => (
                    <div 
                        className="donors-grid"
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                    >
                        {donors.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                                <Crown size={48} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--accent)' }} />
                                <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>{t('admin.donors.empty_msg')}</p>
                                <button onClick={onImport} className="btn-secondary" style={{ padding: '0.8rem 2rem' }}>
                                    {t('admin.donors.import_btn')}
                                </button>
                            </div>
                        )}
                        
                        {donors.map((donor, index) => (
                            <Draggable key={donor.id} draggableId={donor.id} index={index}>
                                {(provided) => (
                                    <div
                                        className="donor-card-premium"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <div className="donor-card-accent"></div>
                                        <div {...provided.dragHandleProps} className="donor-drag-handle">
                                            <GripVertical />
                                        </div>
                                        
                                        <div className="donor-card-header">
                                            <div className="donor-avatar-wrapper">
                                                <img 
                                                    className="donor-avatar"
                                                    src={donor.skinUrl || `https://mc-heads.net/avatar/${donor.name}/64`} 
                                                    alt={donor.name}
                                                    onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`}
                                                />
                                            </div>
                                            <div className="donor-info">
                                                <h4 className="donor-name">{donor.name}</h4>
                                                <div className="donor-ranks">
                                                    {donor.ranks.map(r => (
                                                        <span key={r} className="donor-rank-badge">{r}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="donor-description">
                                            "{donor.description}"
                                        </p>

                                        <div className="donor-card-actions">
                                            <button 
                                                onClick={() => onEdit(donor)} 
                                                className="donor-btn-action edit"
                                            >
                                                <Edit size={14} /> {t('admin.polls.edit_btn', 'Editar')}
                                            </button>
                                            <button 
                                                onClick={() => onDelete(donor.id)}
                                                className="donor-btn-action delete"
                                            >
                                                <Trash2 size={14} /> {t('admin.donors.delete_btn', 'Eliminar')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
