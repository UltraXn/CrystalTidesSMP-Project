import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import KanbanColumn from './KanbanColumn';
import { KanbanTask, KANBAN_COLUMNS, TaskPriority } from '@crystaltides/shared';
import CalendarView, { GoogleEvent } from './CalendarView';
import { Plus, X, Layers, Tag, User, Calendar, List, Target, Clock, RefreshCw } from 'lucide-react';

import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    fetchCalendarEvents, 
    getCalendarSubscriptionUrl, 
    fetchNotionTasks 
} from '../../../services/apiService';

const COLUMNS = KANBAN_COLUMNS;

interface KanbanBoardProps {
    mockTasks?: KanbanTask[];
    mockGoogleEvents?: GoogleEvent[];
    mockNotionTasks?: Record<string, unknown>[];
}

export default function KanbanBoard({ mockTasks, mockGoogleEvents, mockNotionTasks }: KanbanBoardProps = {}) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');

    // --- Queries ---

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['staff-tasks'],
        queryFn: fetchTasks,
        enabled: !mockTasks,
        initialData: mockTasks,
        select: (data) => data.map((t: KanbanTask) => ({ ...t, columnId: t.column_id || 'idea' }))
    });

    const { data: googleEvents = [], isLoading: syncLoading, refetch: refetchGoogleEvents } = useQuery({
        queryKey: ['staff-calendar'],
        queryFn: fetchCalendarEvents,
        enabled: false, // Manual sync
        initialData: mockGoogleEvents,
    });

    const { data: notionTasks = [], isLoading: notionSyncing, refetch: refetchNotionTasks } = useQuery({
        queryKey: ['staff-notion'],
        queryFn: fetchNotionTasks,
        enabled: false, // Manual sync
        initialData: mockNotionTasks,
    });

    // --- Mutations ---

    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-tasks'] })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number, data: any }) => updateTask(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-tasks'] })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-tasks'] })
    });

    const handleUpdateTaskDate = (id: number | string, newDate: Date) => {
        updateMutation.mutate({ 
            id, 
            data: { 
                due_date: newDate.toISOString(),
                date: newDate.toLocaleDateString()
            } 
        });
    };

    const handleUpdateTaskDuration = (id: number | string, start: Date, end: Date) => {
        updateMutation.mutate({ 
            id, 
            data: { 
                due_date: start.toISOString(),
                end_date: end.toISOString(),
                date: start.toLocaleDateString()
            } 
        });
    };

    // --- UI State ---
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
    const [deleteConfirm, setDeleteConfirm] = useState<number | string | null>(null);

    const handleCreateTask = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTask.title.trim()) return;
        
        if (newTask.due_date && newTask.end_date && new Date(newTask.due_date) > new Date(newTask.end_date)) {
            setDateError(t('admin.staff.tasks.date_error', 'End date must be after start date'));
            return;
        }
        setDateError(null);

        createMutation.mutate(newTask, {
            onSuccess: () => {
                setShowCreateModal(false);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        });
    };

    const handleEditTask = (task: KanbanTask) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            priority: (task.priority as TaskPriority) || 'Medium',
            type: task.type || 'General',
            assignee: task.assignee || '',
            due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
            end_date: task.end_date ? new Date(task.end_date).toISOString().slice(0, 16) : ''
        });
        setShowCreateModal(true);
    };

    const handleSaveTask = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!editingTask) return;

        if (newTask.due_date && newTask.end_date && new Date(newTask.due_date) > new Date(newTask.end_date)) {
            setDateError(t('admin.staff.tasks.date_error', 'End date must be after start date'));
            return;
        }
        setDateError(null);

        updateMutation.mutate({ id: editingTask.id, data: newTask }, {
            onSuccess: () => {
                setShowCreateModal(false);
                setEditingTask(null);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        deleteMutation.mutate(deleteConfirm, {
            onSuccess: () => setDeleteConfirm(null)
        });
    };

    const onDragStart = (e: React.DragEvent, cardId: number) => {
        e.dataTransfer.setData("taskId", cardId.toString());
    };

    const onDrop = async (e: React.DragEvent, columnId: string) => {
        const taskId = e.dataTransfer.getData("taskId");
        const task = tasks.find((t: KanbanTask) => t.id.toString() === taskId);
        if (task && task.columnId !== columnId) {
            updateMutation.mutate({ id: task.id, data: { ...task, column_id: columnId } });
        }
    };

    if (tasksLoading) return <div className="p-8 flex justify-center"><Loader /></div>;

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
                            <List /> {t('admin.staff_hub.kanban.view_board', 'Board')}
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={viewMode === 'calendar' ? 'active' : ''}
                        >
                            <Calendar /> {t('admin.staff_hub.kanban.view_calendar', 'Calendar')}
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <>
                            <button className="sync-btn" onClick={() => refetchGoogleEvents()} disabled={syncLoading}>
                                <RefreshCw size={14} className={syncLoading ? 'spin' : ''} />
                                {syncLoading ? t('admin.staff.tasks.syncing') : t('admin.staff.tasks.google_sync')}
                            </button>
                            <button 
                                onClick={async () => {
                                    try {
                                        const url = await getCalendarSubscriptionUrl();
                                        window.open(url, '_blank');
                                    } catch (err) {
                                        console.error("Calendar Sync Error:", err);
                                    }
                                }}
                                className="sync-btn secondary"
                                title="Add CrystalTides Calendar to your Google Calendar"
                            >
                                <Plus /> {t('admin.staff_hub.kanban.add_to_calendar', 'Add to My Calendar')}
                            </button>
                            <button className="sync-btn notion-btn" onClick={() => refetchNotionTasks()} disabled={notionSyncing}>
                                <div className="notion-icon-mini" />
                                {notionSyncing ? t('admin.staff.tasks.syncing') : t('admin.staff.tasks.notion_sync')}
                            </button>
                        </>
                    )}

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="new-task-btn"
                    >
                        <Plus /> {t('admin.staff_hub.kanban.new_task_btn', 'Nueva Tarea')}
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="kanban-grid">
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id} 
                            column={col} 
                            cards={tasks.filter((t: KanbanTask) => t.columnId === col.id)}
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
                                    {editingTask ? <Target color="var(--accent)" /> : <Plus color="var(--accent)" />}
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
                                <X />
                            </button>
                        </div>

                        <div className="modal-body-premium">
                            <div className="form-group">
                                <label className="admin-label-premium"><Target size={12} /> {t('admin.staff_hub.kanban.create_modal.task_title', 'TÍTULO DE LA TAREA')}</label>
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
                                    <X /> {dateError}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="admin-label-premium"><Tag size={12} /> {t('admin.staff_hub.kanban.create_modal.priority', 'Prioridad')}</label>
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
                                    <label className="admin-label-premium"><Layers size={12} /> {t('admin.staff_hub.kanban.create_modal.type', 'Tipo')}</label>
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
                                    <label className="admin-label-premium"><Calendar size={12} /> {t('admin.staff_hub.kanban.create_modal.start_date', 'Inicio')}</label>
                                    <input 
                                        type="datetime-local"
                                        className="admin-input-premium" 
                                        value={newTask.due_date}
                                        onChange={e => { setNewTask({...newTask, due_date: e.target.value}); setDateError(null); }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="admin-label-premium"><Clock size={12} /> {t('admin.staff_hub.kanban.create_modal.end_date', 'Fin')}</label>
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
                                <label className="admin-label-premium"><User size={12} /> {t('admin.staff_hub.kanban.create_modal.assignee', 'Asignado a')}</label>
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
