import { Plus, X, Layers, Tag, User, Calendar, Target, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KanbanTask, TaskPriority } from '@crystaltides/shared';

interface KanbanTaskModalProps {
  isOpen: boolean;
  editingTask: KanbanTask | null;
  newTask: {
    title: string;
    priority: string;
    type: string;
    assignee: string;
    due_date: string;
    end_date: string;
  };
  setNewTask: React.Dispatch<
    React.SetStateAction<{
      title: string;
      priority: string;
      type: string;
      assignee: string;
      due_date: string;
      end_date: string;
    }>
  >;
  dateError: string | null;
  setDateError: (err: string | null) => void;
  onClose: () => void;
  onSave: () => void;
}

export function KanbanTaskModal({
  isOpen,
  editingTask,
  newTask,
  setNewTask,
  dateError,
  setDateError,
  onClose,
  onSave,
}: Readonly<KanbanTaskModalProps>) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <dialog
      open
      aria-labelledby="kanban-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="premium-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        border: 'none',
        margin: 0,
        padding: 0,
        maxWidth: 'none',
        maxHeight: 'none',
      }}
    >
      <div className="premium-modal-content">
        <div className="modal-accent-line" />

        <div className="modal-header-premium">
          <div>
            <h2
              id="kanban-modal-title"
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: '950',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {editingTask ? (
                <Target color="var(--accent)" aria-hidden="true" />
              ) : (
                <Plus color="var(--accent)" aria-hidden="true" />
              )}
              {editingTask
                ? t('admin.staff_hub.kanban.create_modal.title_edit', 'Editar Tarea')
                : t('admin.staff_hub.kanban.create_modal.title_new', 'Nueva Tarea')}
            </h2>
            <p
              style={{
                margin: '0.5rem 0 0',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              {editingTask
                ? t(
                    'admin.staff_hub.kanban.create_modal.subtitle_edit',
                    'Actualiza los detalles de tu tarea',
                  )
                : t(
                    'admin.staff_hub.kanban.create_modal.subtitle_new',
                    'Planifica una nueva actividad para el equipo',
                  )}
            </p>
          </div>
          <button
            aria-label={t('common.close', 'Cerrar ventana')}
            type="button"
            onClick={onClose}
            className="btn-close-premium"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body-premium">
          <div className="form-group">
            <label htmlFor="kanban-task-title" className="admin-label-premium">
              <Target size={12} />{' '}
              {t('admin.staff_hub.kanban.create_modal.task_title', 'TÍTULO DE LA TAREA')}
            </label>
            <input
              id="kanban-task-title"
              className="admin-input-premium"
              placeholder={t(
                'admin.staff_hub.kanban.create_modal.task_placeholder',
                '¿En qué vamos a trabajar?',
              )}
              value={newTask.title}
              onChange={(e) => {
                setNewTask((prev) => ({ ...prev, title: e.target.value }));
                setDateError(null);
              }}
            />
          </div>

          {dateError && (
            <div
              style={{
                background: 'rgba(255, 68, 68, 0.1)',
                color: '#ff4444',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: '1px solid rgba(255, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <X /> {dateError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="kanban-task-priority" className="admin-label-premium">
                <Tag size={12} /> {t('admin.staff_hub.kanban.create_modal.priority', 'Prioridad')}
              </label>
              <select
                id="kanban-task-priority"
                className="admin-select-premium"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                }
              >
                <option value="Low">{t('admin.staff_hub.kanban.priorities.low', 'Baja')}</option>
                <option value="Medium">
                  {t('admin.staff_hub.kanban.priorities.medium', 'Media')}
                </option>
                <option value="High">{t('admin.staff_hub.kanban.priorities.high', 'Alta')}</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="kanban-task-type" className="admin-label-premium">
                <Layers size={12} /> {t('admin.staff_hub.kanban.create_modal.type', 'Tipo')}
              </label>
              <select
                id="kanban-task-type"
                className="admin-select-premium"
                value={newTask.type}
                onChange={(e) => setNewTask((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="General">
                  {t('admin.staff_hub.kanban.types.general', 'General')}
                </option>
                <option value="Bug">{t('admin.staff_hub.kanban.types.bug', 'Bug')}</option>
                <option value="Feature">
                  {t('admin.staff_hub.kanban.types.feature', 'Feature')}
                </option>
                <option value="Maintenance">
                  {t('admin.staff_hub.kanban.types.maintenance', 'Mantenimiento')}
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              position: 'relative',
            }}
          >
            {(!editingTask || editingTask.columnId === 'idea') && (
              <div
                style={{
                  position: 'absolute',
                  top: '-22px',
                  right: '0',
                  fontSize: '0.65rem',
                  color: 'var(--accent)',
                  opacity: 0.8,
                  fontWeight: '900',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {t(
                  'admin.staff_hub.kanban.create_modal.optional_dates',
                  'Fechas opcionales para backlog',
                )}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="kanban-task-start" className="admin-label-premium">
                <Calendar size={12} />{' '}
                {t('admin.staff_hub.kanban.create_modal.start_date', 'Inicio')}
              </label>
              <input
                id="kanban-task-start"
                type="datetime-local"
                className="admin-input-premium"
                value={newTask.due_date}
                onChange={(e) => {
                  setNewTask((prev) => ({ ...prev, due_date: e.target.value }));
                  setDateError(null);
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="kanban-task-end" className="admin-label-premium">
                <Clock size={12} /> {t('admin.staff_hub.kanban.create_modal.end_date', 'Fin')}
              </label>
              <input
                id="kanban-task-end"
                type="datetime-local"
                className="admin-input-premium"
                value={newTask.end_date}
                min={newTask.due_date}
                onChange={(e) => {
                  setNewTask((prev) => ({ ...prev, end_date: e.target.value }));
                  setDateError(null);
                }}
                style={dateError ? { borderColor: 'rgba(255, 68, 68, 0.5)' } : {}}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="kanban-task-assignee" className="admin-label-premium">
              <User size={12} /> {t('admin.staff_hub.kanban.create_modal.assignee', 'Asignado a')}
            </label>
            <input
              id="kanban-task-assignee"
              className="admin-input-premium"
              placeholder={t(
                'admin.staff_hub.kanban.create_modal.assignee_placeholder',
                'Nombre del staff...',
              )}
              value={newTask.assignee}
              onChange={(e) => setNewTask((prev) => ({ ...prev, assignee: e.target.value }))}
            />
          </div>
        </div>

        <div className="modal-footer-premium">
          <button type="button" className="modal-btn-secondary" onClick={onClose}>
            {t('admin.staff_hub.kanban.create_modal.cancel', 'CANCELAR')}
          </button>
          <button type="button" className="modal-btn-primary" onClick={onSave}>
            {editingTask
              ? t('admin.staff_hub.kanban.create_modal.save', 'GUARDAR CAMBIOS')
              : t('admin.staff_hub.kanban.create_modal.create', 'CREAR TAREA')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
