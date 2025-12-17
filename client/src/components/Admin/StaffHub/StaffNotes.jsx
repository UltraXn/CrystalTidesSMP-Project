import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const COLORS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#f3f4f6']; // Yellow, Blue, Pink, Green, Gray (Light tones for paper effect)

export default function StaffNotes() {
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('crystal_staff_notes');
        return saved ? JSON.parse(saved) : [
            { id: 1, text: 'Recordar reiniciar el servidor mañana a las 3:00 AM para el mantenimiento semanal.', color: '#fef3c7', date: '24/10' },
            { id: 2, text: 'Revisar logs de xGamer123 por posible X-Ray.', color: '#dbeafe', date: '25/10' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('crystal_staff_notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = () => {
        const text = prompt("Nueva Nota:");
        if (!text) return;
        
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newNote = {
            id: Date.now(),
            text,
            color: randomColor,
            date: new Date().toLocaleDateString(),
            rotation: Math.random() * 2 - 1 // Calc once
        };
        setNotes([newNote, ...notes]);
    };

    const deleteNote = (id) => {
        if(window.confirm('¿Borrar nota?')) {
            setNotes(notes.filter(n => n.id !== id));
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#ccc' }}>Notas Rápidas</h3>
                <button 
                    onClick={addNote}
                    style={{ 
                        background: 'transparent', 
                        border: '1px dashed #666', 
                        color: '#888',
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                >
                    <FaPlus /> Nueva Nota
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem', 
                overflowY: 'auto',
                paddingRight: '5px'
            }}>
                {notes.map(note => (
                    <div key={note.id} style={{
                        background: note.color,
                        color: '#000',
                        padding: '1rem',
                        borderRadius: '2px', // Post-it look
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                        minHeight: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transform: `rotate(${note.rotation || 0}deg)` // Slight tilt
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                            {note.text}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 'bold' }}>{note.date}</span>
                            <button 
                                onClick={() => deleteNote(note.id)}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    opacity: 0.5,
                                    color: '#000',
                                    padding: '5px'
                                }}
                                title="Borrar"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
