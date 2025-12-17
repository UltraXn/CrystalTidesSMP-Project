import React from 'react';
import { FaGripVertical, FaUserCircle, FaClock } from 'react-icons/fa';

export default function KanbanCard({ card, onDragStart }) {
    return (
        <div 
            className="kanban-card"
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
            style={{
                background: '#252525',
                padding: '0.8rem',
                marginBottom: '0.8rem',
                borderRadius: '6px',
                border: '1px solid #333',
                cursor: 'grab',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', color: '#eee', fontWeight: '500', lineHeight: '1.4' }}>
                    {card.title}
                </span>
                <FaGripVertical color="#555" size={14} style={{ cursor: 'grab', flexShrink: 0 }} />
            </div>

            {/* Tags / Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                {card.priority && (
                    <span style={{ 
                        background: getPriorityColor(card.priority), 
                        color: '#000', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase'
                    }}>
                        {card.priority}
                    </span>
                )}
                {card.type && (
                     <span style={{ 
                        background: '#333', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        border: '1px solid #444'
                    }}>
                        {card.type}
                    </span>
                )}
            </div>

             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                     <FaUserCircle color="#666" />
                     <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{card.assignee || 'Unassigned'}</span>
                </div>
                {card.date && (
                    <span style={{ fontSize: '0.7rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={10} /> {card.date}
                    </span>
                 )}
            </div>
        </div>
    );
}

function getPriorityColor(p) {
    if (p === 'High') return '#ef4444'; 
    if (p === 'Medium') return '#facc15';
    if (p === 'Low') return '#10b981';
    return '#ccc';
}
