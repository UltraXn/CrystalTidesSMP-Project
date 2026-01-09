import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KanbanColumn from './KanbanColumn';
import { KanbanTask, KANBAN_COLUMNS, TaskPriority } from '@crystaltides/shared';
import CalendarView, { GoogleEvent } from './CalendarView';
import { FaPlus, FaTimes, FaLayerGroup, FaTag, FaUser, FaCalendar, FaList, FaGoogle, FaBullseye, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

const COLUMNS = KANBAN_COLUMNS;

interface KanbanBoardProps {
    mockTasks?: KanbanTask[];
    mockGoogleEvents?: GoogleEvent[];
    mockNotionTasks?: Record<string, unknown>[];
}

export default function KanbanBoard({ mockTasks, mockGoogleEvents, mockNotionTasks }: KanbanBoardProps = {}) {


    const { t } = useTranslation();
    const [tasks, setTasks] = useState<KanbanTask[]>((mockTasks || []).map(t => ({...t, columnId: t.column_id || 'idea'})));
    const [loading, setLoading] = useState(!mockTasks);
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>(mockGoogleEvents || []);
    const [notionTasks, setNotionTasks] = useState<Record<string, unknown>[]>(mockNotionTasks || []);
    const [syncing, setSyncing] = useState(false);
    const [notionSyncing, setNotionSyncing] = useState(false);

    // --- Google Calendar Integration ---
    const fetchGoogleEvents = async () => {
        setSyncing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!response.ok) throw new Error('Failed to fetch calendar');
            const events = await response.json();
            setGoogleEvents(events);
        } catch (err) {
            console.error("Calendar Sync Error:", err);
            // Optionally show toast error
        } finally {
            setSyncing(false);
        }
    };

    const subscribeToCalendar = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar/subscribe`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!response.ok) throw new Error('Failed to get subscribe link');
            const { url } = await response.json();
            window.open(url, '_blank');
        } catch (err) {
            console.error("Subscription Error:", err);
        }
    };

    const fetchNotionTasks = async () => {
        setNotionSyncing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/notion`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!response.ok) throw new Error('Failed to fetch Notion tasks');
            const tasks = await response.json();
            setNotionTasks(tasks);
        } catch (err) {
            console.error("Notion Sync Error:", err);
        } finally {
            setNotionSyncing(false);
        }
    };

    useEffect(() => {
        if (notionTasks.length > 0) {
            console.log("Synced Notion Tasks:", notionTasks);
        }
    }, [notionTasks]);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'Medium',
        type: 'General',
        assignee: '',
        due_date: '',
        end_date: ''
    });
    const [dateError, setDateError] = useState<string | null>(null);

    // Delete Modal State
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            if (mockTasks) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(`${API_URL}/staff/tasks`, {
                   headers: getAuthHeaders(session?.access_token || null)
                });
                if (res.ok) {
                    const data = await res.json() as KanbanTask[];
                    const mappedData = data.map((task: KanbanTask) => ({
                        ...task,
                        columnId: task.column_id || 'idea'
                    }));
                    setTasks(mappedData);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [mockTasks]);

    const handleCreateTask = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTask.title.trim()) return;

        if (newTask.due_date && newTask.end_date && new Date(newTask.end_date) < new Date(newTask.due_date)) {
            setDateError(t('admin.staff_hub.kanban.create_modal.date_error', 'La fecha de fin no puede ser anterior a la de inicio'));
            return;
        }
        setDateError(null);

        const taskPayload = {
            ...newTask,
            assignee: newTask.assignee || 'Unassigned',
            column_id: 'idea',
            date: newTask.due_date ? new Date(newTask.due_date).toLocaleDateString() : new Date().toLocaleDateString(),
            due_date: newTask.due_date || null,
            end_date: newTask.end_date || null
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(taskPayload)
            });

            if (res.ok) {
                const savedTask = await res.json();
                setTasks(prev => [{ ...savedTask, columnId: savedTask.column_id || 'idea' }, ...prev]);
                setShowCreateModal(false);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleUpdateTaskDate = async (id: number | string, newDate: Date) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ 
                    due_date: newDate.toISOString(),
                    date: newDate.toLocaleDateString()
                })
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
            }
        } catch (error) {
            console.error("Error updating task date:", error);
        }
    };

    const handleUpdateTaskDuration = async (id: number | string, start: Date, end: Date) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ 
                    due_date: start.toISOString(),
                    end_date: end.toISOString(),
                    date: start.toLocaleDateString()
                })
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
            }
        } catch (error) {
            console.error("Error updating task duration:", error);
        }
    };

    const handleEditTask = (task: KanbanTask) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            priority: task.priority || 'Medium',
            type: task.type || 'General',
            assignee: task.assignee || '',
            due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
            end_date: task.end_date ? new Date(task.end_date).toISOString().slice(0, 16) : ''
        });
        setShowCreateModal(true);
    };

    const handleSaveTask = async () => {
        if (!editingTask) return;

        if (newTask.due_date && newTask.end_date && new Date(newTask.end_date) < new Date(newTask.due_date)) {
            setDateError(t('admin.staff_hub.kanban.create_modal.date_error', 'La fecha de fin no puede ser anterior a la de inicio'));
            return;
        }
        setDateError(null);
        
        const taskPayload = {
            ...newTask,
            due_date: newTask.due_date || null,
            end_date: newTask.end_date || null,
            date: newTask.due_date ? new Date(newTask.due_date).toLocaleDateString() : new Date().toLocaleDateString()
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${editingTask.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(taskPayload)
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
                setShowCreateModal(false);
                setEditingTask(null);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const id = deleteConfirm;

        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/staff/tasks/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
             });
        } catch (error) {
            console.error("Error deleting task:", error);
            setTasks(previousTasks);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const onDragStart = (e: React.DragEvent, cardId: number) => {
        e.dataTransfer.setData("cardId", cardId.toString());
    };

    const onDrop = async (e: React.DragEvent, columnId: string) => {
        const cardId = e.dataTransfer.getData("cardId");
        
        const taskToUpdate = tasks.find(t => t.id === Number(cardId));
        if (!taskToUpdate || taskToUpdate.columnId === columnId) return;

        const previousTasks = [...tasks];
        setTasks(prev => prev.map(task => {
            if (task.id === Number(cardId)) {
                return { ...task, columnId };
            }
            return task;
        }));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/staff/tasks/${cardId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ column_id: columnId })
            });
        } catch (error) {
            console.error("Error updating task:", error);
            setTasks(previousTasks);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader style={{ minHeight: '100px' }} />
        </div>
    );

    return (
        <div className="kanban-board-container">
            <div className="kanban-header">
                <h3>{t('admin.staff_hub.kanban.title', 'Tablero')}</h3>
                <div className="kanban-controls">
                    <div className="view-mode-toggle">
                        <button 
                            onClick={() => setViewMode('board')}
                            className={viewMode === 'board' ? 'active' : ''}
                        >
                            <FaList /> {t('admin.staff_hub.kanban.view_board', 'Board')}
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={viewMode === 'calendar' ? 'active' : ''}
                        >
                            <FaCalendar /> {t('admin.staff_hub.kanban.view_calendar', 'Calendar')}
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <>
                            <button 
                                onClick={fetchGoogleEvents}
                                disabled={syncing}
                                className="sync-btn google"
                            >
                                <FaGoogle /> {syncing ? t('admin.staff_hub.kanban.syncing', 'Syncing...') : t('admin.staff_hub.kanban.sync_calendar', 'Sync Calendar')}
                            </button>
                            <button 
                                onClick={subscribeToCalendar}
                                className="sync-btn secondary"
                                title="Add CrystalTides Calendar to your Google Calendar"
                            >
                                <FaPlus /> {t('admin.staff_hub.kanban.add_to_calendar', 'Add to My Calendar')}
                            </button>
                            <button 
                                onClick={fetchNotionTasks}
                                disabled={notionSyncing}
                                className="sync-btn notion"
                            >
                                 <FaBullseye /> {notionSyncing ? t('admin.staff_hub.kanban.syncing', 'Syncing...') : t('admin.staff_hub.kanban.sync_notion', 'Sync Notion')}
                            </button>
                        </>
                    )}

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="new-task-btn"
                    >
                        <FaPlus /> {t('admin.staff_hub.kanban.new_task_btn', 'Nueva Tarea')}
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="kanban-grid">
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id} 
                            column={col} 
                            cards={tasks.filter(t => t.columnId === col.id)}
                            onDragStart={onDragStart}
                            onDrop={onDrop}
                            onDelete={(id) => setDeleteConfirm(id)}
                            onEdit={handleEditTask}
                        />
                    ))}
                </div>
            ) : (
                <CalendarView
                    tasks={tasks}
                    googleEvents={googleEvents}
                    notionTasks={notionTasks}
                    onEditTask={handleEditTask}
                    onUpdateEventDate={handleUpdateTaskDate}
                    onUpdateEventDuration={handleUpdateTaskDuration}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="premium-modal-overlay">
                    <div className="premium-modal-content">
                        <div className="modal-accent-line" />
                        
                        <div className="modal-header-premium">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '950', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {editingTask ? <FaBullseye color="var(--accent)" /> : <FaPlus color="var(--accent)" />}
                                    {editingTask ? t('admin.staff_hub.kanban.create_modal.title_edit', 'Editar Tarea') : t('admin.staff_hub.kanban.create_modal.title_new', 'Nueva Tarea')}
                                </h2>
                                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 500 }}>
                                    {editingTask ? t('admin.staff_hub.kanban.create_modal.subtitle_edit', 'Actualiza los detalles de tu tarea') : t('admin.staff_hub.kanban.create_modal.subtitle_new', 'Planifica una nueva actividad para el equipo')}
                                </p>
                            </div>
                            <button 
                                onClick={() => { setShowCreateModal(false); setEditingTask(null); }}
                                className="btn-close-premium"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body-premium">
                            <div className="form-group">
                                <label className="admin-label-premium"><FaBullseye size={12} /> {t('admin.staff_hub.kanban.create_modal.task_title', 'TÍTULO DE LA TAREA')}</label>
                                <input 
                                    className="admin-input-premium" 
                                    placeholder={t('admin.staff_hub.kanban.create_modal.task_placeholder', '¿En qué vamos a trabajar?')}
                                    value={newTask.title}
                                    onChange={e => { setNewTask({...newTask, title: e.target.value}); setDateError(null); }}
                                />
                            </div>

                            {dateError && (
                                <div style={{ 
                                    background: 'rgba(255, 68, 68, 0.1)', 
                                    color: '#ff4444', 
                                    padding: '12px 16px', 
                                    borderRadius: '14px', 
                                    fontSize: '0.85rem', 
                                    fontWeight: '700',
                                    border: '1px solid rgba(255, 68, 68, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FaTimes /> {dateError}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="admin-label-premium"><FaTag size={12} /> {t('admin.staff_hub.kanban.create_modal.priority', 'Prioridad')}</label>
                                    <select 
                                        className="admin-select-premium"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                                    >
                                        <option value="Low">{t('admin.staff_hub.kanban.priorities.low', 'Baja')}</option>
                                        <option value="Medium">{t('admin.staff_hub.kanban.priorities.medium', 'Media')}</option>
                                        <option value="High">{t('admin.staff_hub.kanban.priorities.high', 'Alta')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="admin-label-premium"><FaLayerGroup size={12} /> {t('admin.staff_hub.kanban.create_modal.type', 'Tipo')}</label>
                                    <select 
                                        className="admin-select-premium"
                                        value={newTask.type}
                                        onChange={e => setNewTask({...newTask, type: e.target.value})}
                                    >
                                        <option value="General">{t('admin.staff_hub.kanban.types.general', 'General')}</option>
                                        <option value="Bug">{t('admin.staff_hub.kanban.types.bug', 'Bug')}</option>
                                        <option value="Feature">{t('admin.staff_hub.kanban.types.feature', 'Feature')}</option>
                                        <option value="Maintenance">{t('admin.staff_hub.kanban.types.maintenance', 'Mantenimiento')}</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', position: 'relative' }}>
                                {(!editingTask || editingTask.columnId === 'idea') && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '-22px', 
                                        right: '0', 
                                        fontSize: '0.65rem', 
                                        color: 'var(--accent)', 
                                        opacity: 0.8,
                                        fontWeight: '900',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}>
                                       {t('admin.staff_hub.kanban.create_modal.optional_dates', 'Fechas opcionales para backlog')}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="admin-label-premium"><FaCalendarAlt size={12} /> {t('admin.staff_hub.kanban.create_modal.start_date', 'Inicio')}</label>
                                    <input 
                                        type="datetime-local"
                                        className="admin-input-premium" 
                                        value={newTask.due_date}
                                        onChange={e => { setNewTask({...newTask, due_date: e.target.value}); setDateError(null); }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="admin-label-premium"><FaClock size={12} /> {t('admin.staff_hub.kanban.create_modal.end_date', 'Fin')}</label>
                                    <input 
                                        type="datetime-local"
                                        className="admin-input-premium" 
                                        value={newTask.end_date}
                                        min={newTask.due_date}
                                        onChange={e => { setNewTask({...newTask, end_date: e.target.value}); setDateError(null); }}
                                        style={dateError ? { borderColor: 'rgba(255, 68, 68, 0.5)' } : {}}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="admin-label-premium"><FaUser size={12} /> {t('admin.staff_hub.kanban.create_modal.assignee', 'Asignado a')}</label>
                                <input 
                                    className="admin-input-premium" 
                                    placeholder={t('admin.staff_hub.kanban.create_modal.assignee_placeholder', 'Nombre del staff...')}
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="modal-footer-premium">
                            <button 
                                className="modal-btn-secondary"
                                onClick={() => { setShowCreateModal(false); setEditingTask(null); }}
                            >
                                {t('admin.staff_hub.kanban.create_modal.cancel', 'CANCELAR')}
                            </button>
                            <button 
                                className="modal-btn-primary"
                                onClick={editingTask ? handleSaveTask : handleCreateTask}
                            >
                                {editingTask ? t('admin.staff_hub.kanban.create_modal.save', 'GUARDAR CAMBIOS') : t('admin.staff_hub.kanban.create_modal.create', 'CREAR TAREA')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title={t('admin.staff_hub.kanban.delete_modal.title', 'Eliminar Tarea')}
                message={t('admin.staff_hub.kanban.delete_modal.msg', '¿Estás seguro de que quieres eliminar esta tarea permanentemente?')}
                confirmText={t('admin.staff_hub.kanban.delete_modal.confirm', 'Eliminar')}
                isDanger={true}
            />
        </div>
    );
}
