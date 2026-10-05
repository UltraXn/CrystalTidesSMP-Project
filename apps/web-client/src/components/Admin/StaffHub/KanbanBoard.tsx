import React from 'react';
import KanbanColumn from './KanbanColumn';
import { KanbanTask, KANBAN_COLUMNS } from '@crystaltides/shared';
import CalendarView, { GoogleEvent } from './CalendarView';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { useKanbanBoard } from './useKanbanBoard';
import { KanbanHeader } from './KanbanHeader';
import { KanbanTaskModal } from './KanbanTaskModal';

const COLUMNS = KANBAN_COLUMNS;

interface KanbanBoardProps {
  mockTasks?: KanbanTask[];
  mockGoogleEvents?: GoogleEvent[];
  mockNotionTasks?: Record<string, unknown>[];
}

const onDragStart = (e: React.DragEvent, cardId: number) => {
  e.dataTransfer.setData('cardId', cardId.toString());
};

export default function KanbanBoard({
  mockTasks,
  mockGoogleEvents,
  mockNotionTasks,
}: KanbanBoardProps = {}) {
  const {
    t,
    tasks,
    loading,
    viewMode,
    setViewMode,
    googleEvents,
    notionTasks,
    syncing,
    notionSyncing,
    fetchGoogleEvents,
    fetchNotionTasks,
    subscribeToCalendar,
    showCreateModal,
    editingTask,
    newTask,
    setNewTask,
    dateError,
    setDateError,
    deleteConfirm,
    setDeleteConfirm,
    handleCreateTask,
    handleSaveTask,
    handleEditTask,
    confirmDelete,
    onDrop,
    handleUpdateTaskDate,
    handleUpdateTaskDuration,
    openNewTaskModal,
    closeTaskModal,
  } = useKanbanBoard({ mockTasks, mockGoogleEvents, mockNotionTasks });

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Loader style={{ minHeight: '100px' }} />
      </div>
    );
  }

  return (
    <div className="kanban-board-container">
      <KanbanHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        syncing={syncing}
        notionSyncing={notionSyncing}
        onFetchGoogleEvents={fetchGoogleEvents}
        onSubscribeToCalendar={subscribeToCalendar}
        onFetchNotionTasks={fetchNotionTasks}
        onOpenNewTaskModal={openNewTaskModal}
      />

      {viewMode === 'board' ? (
        <div className="kanban-grid">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={tasks.filter((t) => t.columnId === col.id)}
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

      <KanbanTaskModal
        isOpen={showCreateModal}
        editingTask={editingTask}
        newTask={newTask}
        setNewTask={setNewTask}
        dateError={dateError}
        setDateError={setDateError}
        onClose={closeTaskModal}
        onSave={editingTask ? handleSaveTask : handleCreateTask}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title={t('admin.staff_hub.kanban.delete_modal.title', 'Eliminar Tarea')}
        message={t(
          'admin.staff_hub.kanban.delete_modal.msg',
          '¿Estás seguro de que quieres eliminar esta tarea permanentemente?',
        )}
        confirmText={t('admin.staff_hub.kanban.delete_modal.confirm', 'Eliminar')}
        isDanger={true}
      />
    </div>
  );
}
