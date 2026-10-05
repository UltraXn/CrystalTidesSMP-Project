import { Plus, List, Calendar, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
  </svg>
);

interface KanbanHeaderProps {
  viewMode: 'board' | 'calendar';
  setViewMode: (mode: 'board' | 'calendar') => void;
  syncing: boolean;
  notionSyncing: boolean;
  onFetchGoogleEvents: () => void;
  onSubscribeToCalendar: () => void;
  onFetchNotionTasks: () => void;
  onOpenNewTaskModal: () => void;
}

export function KanbanHeader({
  viewMode,
  setViewMode,
  syncing,
  notionSyncing,
  onFetchGoogleEvents,
  onSubscribeToCalendar,
  onFetchNotionTasks,
  onOpenNewTaskModal,
}: KanbanHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="kanban-header">
      <h3>{t('admin.staff_hub.kanban.title', 'Tablero')}</h3>
      <div className="kanban-controls">
        <div className="view-mode-toggle">
          <button
            type="button"
            onClick={() => setViewMode('board')}
            className={viewMode === 'board' ? 'active' : ''}
          >
            <List /> {t('admin.staff_hub.kanban.view_board', 'Board')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'active' : ''}
          >
            <Calendar /> {t('admin.staff_hub.kanban.view_calendar', 'Calendar')}
          </button>
        </div>

        {viewMode === 'calendar' && (
          <>
            <button
              type="button"
              onClick={onFetchGoogleEvents}
              disabled={syncing}
              className="sync-btn google"
            >
              <GoogleIcon />{' '}
              {syncing
                ? t('admin.staff_hub.kanban.syncing', 'Syncing...')
                : t('admin.staff_hub.kanban.sync_calendar', 'Sync Calendar')}
            </button>
            <button
              type="button"
              onClick={onSubscribeToCalendar}
              className="sync-btn secondary"
              title="Add CrystalTides Calendar to your Google Calendar"
            >
              <Plus /> {t('admin.staff_hub.kanban.add_to_calendar', 'Add to My Calendar')}
            </button>
            <button
              type="button"
              onClick={onFetchNotionTasks}
              disabled={notionSyncing}
              className="sync-btn notion"
            >
              <Target />{' '}
              {notionSyncing
                ? t('admin.staff_hub.kanban.syncing', 'Syncing...')
                : t('admin.staff_hub.kanban.sync_notion', 'Sync Notion')}
            </button>
          </>
        )}

        <button type="button" onClick={onOpenNewTaskModal} className="new-task-btn">
          <Plus /> {t('admin.staff_hub.kanban.new_task_btn', 'Nueva Tarea')}
        </button>
      </div>
    </div>
  );
}
