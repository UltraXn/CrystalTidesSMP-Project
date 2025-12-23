import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#f3f4f6']; // Yellow, Blue, Pink, Green, Gray

interface Note {
    id: number;
    text: string;
    color: string;
    rotation?: number;
    date?: string;
}

export default function StaffNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API_URL}/staff/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const addNote = async () => {
        const text = prompt("Nueva Nota:");
        if (!text) return;
        
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newNoteData = {
            text,
            color: randomColor,
            rotation: Math.random() * 2 - 1
        };

        try {
            const res = await fetch(`${API_URL}/staff/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNoteData)
            });

            if (res.ok) {
                const savedNote = await res.json();
                setNotes(prev => [savedNote, ...prev]);
            }
        } catch (error) {
            console.error("Error creating note:", error);
        }
    };

    const deleteNote = async (id: number) => {
        if (!window.confirm('¿Borrar nota?')) return;

        // Optimistic update
        const previousNotes = [...notes];
        setNotes(notes.filter(n => n.id !== id));

        try {
            const res = await fetch(`${API_URL}/staff/notes/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
        } catch (error) {
            console.error("Error deleting note:", error);
            setNotes(previousNotes); // Revert on error
        }
    };

    if (loading) return <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Cargando notas...</div>;

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
