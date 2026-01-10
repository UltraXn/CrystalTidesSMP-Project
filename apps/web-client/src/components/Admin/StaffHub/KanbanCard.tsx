import React from 'react';
import { GripVertical, UserCircle2, Clock, Trash2, Edit2 } from 'lucide-react';
import { KanbanTask } from '@crystaltides/shared';
import { useTranslation } from 'react-i18next';

interface KanbanCardProps {
    card: KanbanTask;
    onDragStart: (e: React.DragEvent, cardId: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (task: KanbanTask) => void;
}

export default function KanbanCard({ card, onDragStart, onDelete, onEdit }: KanbanCardProps) {
    const { t } = useTranslation();
    const hasTime = card.due_date?.includes('T');
    
    return (
        <div 
            className="kanban-card-premium"
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
        >
            <div className="card-header">
                <span className="card-title-premium">
                    {card.title}
                </span>
                <div className="card-actions">
                    {onEdit && (
                        <button 
                            className="card-action-btn edit"
                            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            className="card-action-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <div className="card-grip">
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>

            <div className="card-tags">
                {card.priority && (
                    <span 
                        className="card-tag"
                        style={{ 
                            background: `${getPriorityColor(card.priority)}20`, 
                            color: getPriorityColor(card.priority), 
                            border: `1px solid ${getPriorityColor(card.priority)}40`
                        }}
                    >
                        {t(`admin.staff_hub.kanban.priorities.${card.priority.toLowerCase()}`, card.priority)}
                    </span>
                )}
                {" "}
                {card.type && <span className="card-tag type">
                    {t(`admin.staff_hub.kanban.types.${card.type.toLowerCase()}`, card.type)}
                </span>}
            </div>

             <div className="card-footer">
                <div className="card-assignee">
                     {card.assignee && card.assignee !== 'Unassigned' ? (
                        <img 
                            src={`https://minotar.net/helm/${card.assignee}/24.png`} 
                            alt={card.assignee}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                     ) : (
                         <UserCircle2 color="#333" size={18} />
                     )}
                     <span className="card-assignee-name">
                        {card.assignee === 'Unassigned' || !card.assignee 
                            ? t('admin.staff_hub.kanban.card.unassigned', 'Sin asignar') 
                            : card.assignee}
                     </span>
                </div>
                {card.columnId === 'idea' ? (
                    <div className="card-date-badge backlog">
                        <Clock size={10} color="#666" />
                        <span>{t('admin.staff_hub.kanban.card.backlog', 'Por confirmar')}</span>
                    </div>
                ) : card.due_date ? (
                    <div className="card-date-badge">
                        <Clock size={10} color="var(--accent)" />
                        <span style={{ fontWeight: '800' }}>
                            {hasTime ? new Date(card.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : card.date}
                        </span>
                    </div>
                 ) : null}
            </div>
        </div>
    );
}

function getPriorityColor(p: string) {
    if (p === 'High') return '#ef4444'; 
    if (p === 'Medium') return '#facc15';
    if (p === 'Low') return '#10b981';
    return '#ccc';
}
