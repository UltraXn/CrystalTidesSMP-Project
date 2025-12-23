import React from 'react';
import KanbanCard, { KanbanTask } from './KanbanCard';

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
}

export default function KanbanColumn({ column, cards, onDragStart, onDrop }: KanbanColumnProps) {
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, column.id);
    };

    return (
        <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                flex: '0 0 300px',
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                overflow: 'hidden'
            }}
        >
            <div style={{ 
                marginBottom: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: `2px solid ${column.color}` 
            }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', letterSpacing: '0.5px' }}>{column.title}</h4>
                <span style={{ 
                    background: '#333', 
                    color: '#aaa', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    {cards.length}
                </span>
            </div>

            <div 
                className="kanban-cards-container"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '4px',
                    minHeight: '100px' // Drop target area
                }}
            >
                {cards.map(card => (
                    <KanbanCard 
                        key={card.id} 
                        card={card} 
                        onDragStart={onDragStart} 
                    />
                ))}
                {cards.length === 0 && (
                    <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#444', 
                        fontSize: '0.85rem', 
                        border: '2px dashed #333', 
                        borderRadius: '6px',
                        minHeight: '80px'
                    }}>
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}
