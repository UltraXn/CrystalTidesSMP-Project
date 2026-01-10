import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = [
    'rgba(139, 92, 246, 0.15)', // Purple
    'rgba(59, 130, 246, 0.15)', // Blue
    'rgba(16, 185, 129, 0.15)', // Emerald
    'rgba(249, 115, 22, 0.15)', // Orange
    'rgba(255, 255, 255, 0.05)' // Gray
];

interface Note {
    id: number;
    text: string;
    color: string;
    date?: string;
}

export default function StaffNotes() {
    const { t } = useTranslation();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        fetchNotes();

        // Real-time subscription for notes
        const channel = supabase.channel('public:staff_notes')
            .on('postgres_changes', { event: '*', table: 'staff_notes', schema: 'public' }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotes = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/notes`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
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

    const handleCreateNote = async () => {
        if (!newNoteText.trim()) return;
        
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newNoteData = {
            text: newNoteText,
            color: randomColor,
            rotation: 0 
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/notes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                 },
                body: JSON.stringify(newNoteData)
            });

            if (res.ok) {
                const savedNote = await res.json();
                setNotes(prev => [savedNote, ...prev]);
                setShowCreateModal(false);
                setNewNoteText('');
            }
        } catch (error) {
            console.error("Error creating note:", error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        // Optimistic update
        const previousNotes = [...notes];
        setNotes(notes.filter(n => n.id !== deleteConfirmId));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/notes/${deleteConfirmId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to delete');
        } catch (error) {
            console.error("Error deleting note:", error);
            setNotes(previousNotes); // Revert on error
        } finally {
            setDeleteConfirmId(null);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader style={{ height: 'auto', minHeight: '100px' }} />
        </div>
    );

    return (
        <div className="staff-notes-container">
            <div className="notes-header-premium">
                <h3 className="admin-page-title-small">
                    {t('admin.staff_hub.notes.title', 'Notas Rápidas')}
                </h3>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="new-task-btn"
                    style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                >
                    <Plus /> {t('admin.staff_hub.notes.new_note_btn', 'Nueva Nota')}
                </button>
            </div>

            <div className="staff-notes-grid">
                {notes.map(note => {
                    // Fallback for old light-theme notes (legacy hex colors)
                    // If the color starts with '#', we map it to one of the new dark colors
                    // to prevent white-text-on-light-background issues.
                    const isLegacyColor = note.color.startsWith('#');
                    const displayColor = isLegacyColor ? COLORS[note.id % COLORS.length] : note.color;

                    return (
                        <div key={note.id} className="staff-note-card" style={{ background: displayColor }}>
                            <p className="note-text-premium">
                                {note.text}
                            </p>
                            
                            <div className="note-footer-premium">
                                <span className="note-date-premium">{note.date}</span>
                                <button 
                                    onClick={() => setDeleteConfirmId(note.id)}
                                    className="note-delete-btn"
                                    title={t('common.delete', 'Borrar')}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
            })}
        </div>

            {/* Create Note Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div 
                        className="modal-content" 
                        style={{ 
                            width: '400px', 
                            maxWidth: '90%', 
                            background: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ 
                                margin: '0 0 1.5rem 0', 
                                fontSize: '1.2rem',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ color: 'var(--accent)', display:'flex' }}><Plus size={16}/></span> {t('admin.staff_hub.notes.create_modal.title', 'Nueva Nota')}
                            </h3>
                            
                            <textarea
                                autoFocus
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder={t('admin.staff_hub.notes.create_modal.placeholder', 'Escribe tu nota aquí...')}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    padding: '1rem',
                                    minHeight: '120px',
                                    resize: 'none',
                                    outline: 'none',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreateNote();
                                    }
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                <button 
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary"
                                    style={{ padding: '0.6rem 1.2rem' }}
                                >
                                    {t('admin.staff_hub.notes.create_modal.cancel', 'Cancelar')}
                                </button>
                                <button 
                                    onClick={handleCreateNote}
                                    className="btn-primary"
                                    style={{ padding: '0.6rem 1.5rem' }}
                                >
                                    {t('admin.staff_hub.notes.create_modal.save', 'Guardar Nota')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title={t('admin.staff_hub.notes.delete_modal.title', '¿Eliminar Nota?')}
                message={t('admin.staff_hub.notes.delete_modal.msg', 'Esta acción no se puede deshacer.')}
                confirmText={t('admin.staff_hub.notes.delete_modal.confirm', 'Sí, Eliminar')}
                isDanger={true}
            />
        </div>
    );
}
