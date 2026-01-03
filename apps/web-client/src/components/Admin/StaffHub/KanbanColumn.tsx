import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import KanbanCard from './KanbanCard';
import { KanbanTask } from '@crystaltides/shared';
import { FaChevronDown, FaChevronRight, FaLayerGroup } from 'react-icons/fa';

interface KanbanColumnData {
    id: string;
    title: string;
    color: string;
}

interface KanbanColumnProps {
    column: KanbanColumnData;
    cards: KanbanTask[];
    onDragStart: (e: React.DragEvent, cardId: number) => void;
    onDrop: (e: React.DragEvent, columnId: string) => void;
    onDelete?: (id: number) => void;
    onEdit?: (task: KanbanTask) => void;
}

export default function KanbanColumn({ column, cards, onDragStart, onDrop, onDelete, onEdit }: KanbanColumnProps) {
    const { t } = useTranslation();
    // Collapsed by default as requested
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        // Auto-expand on drag over if collapsed? Optional UX improvement
        if (!isExpanded) setIsExpanded(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, column.id);
    };

    return (
        <div 
            className={`kanban-column ${!isExpanded ? 'collapsed' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div 
                className="column-header-premium"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="column-count-premium">
                    {cards.length}
                </span>

                <div className="column-header-center">
                    <div className="column-dot" style={{ background: column.color, boxShadow: `0 0 15px ${column.color}` }}></div>
                    <h4 className="column-title">{column.title}</h4>
                </div>
                
                <div className="toggle-icon-premium">
                    {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </div>
            </div>

            {isExpanded && (
                <div className="kanban-cards-container">
                    {cards.map(card => (
                        <KanbanCard 
                            key={card.id} 
                            card={card} 
                            onDragStart={onDragStart} 
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                    {cards.length === 0 && (
                        <div className="empty-column-placeholder">
                            <FaLayerGroup />
                            <span>{t('admin.staff_hub.kanban.empty', 'Vacío')}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
