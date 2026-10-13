import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KanbanTask } from '@crystaltides/shared';
import { GoogleEvent } from './CalendarView';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

interface UseKanbanBoardParams {
  mockTasks?: KanbanTask[];
  mockGoogleEvents?: GoogleEvent[];
  mockNotionTasks?: Record<string, unknown>[];
}

export function useKanbanBoard({
  mockTasks,
  mockGoogleEvents,
  mockNotionTasks,
}: UseKanbanBoardParams) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<KanbanTask[]>(() =>
    (mockTasks ?? []).map((task) => ({ ...task, columnId: task.column_id ?? 'idea' })),
  );
  const [loading, setLoading] = useState(!mockTasks);
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>(mockGoogleEvents || []);
  const [notionTasks, setNotionTasks] = useState<Record<string, unknown>[]>(mockNotionTasks || []);
  const [syncing, setSyncing] = useState(false);
  const [notionSyncing, setNotionSyncing] = useState(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium',
    type: 'General',
    assignee: '',
    due_date: '',
    end_date: '',
  });
  const [dateError, setDateError] = useState<string | null>(null);

  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // --- Google Calendar Integration ---
  const fetchGoogleEvents = async () => {
    setSyncing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar`,
        {
          headers: getAuthHeaders(session?.access_token ?? null),
        },
      );
      if (!response.ok) throw new Error('Failed to fetch calendar');
      const events = await response.json();
      setGoogleEvents(events);
    } catch (err) {
      console.error('Calendar Sync Error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchNotionTasks = async () => {
    setNotionSyncing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/notion`, {
        headers: getAuthHeaders(session?.access_token ?? null),
      });
      if (!response.ok) throw new Error('Failed to fetch Notion tasks');
      const fetchedTasks = await response.json();
      setNotionTasks(fetchedTasks);
    } catch (err) {
      console.error('Notion Sync Error:', err);
    } finally {
      setNotionSyncing(false);
    }
  };

  const subscribeToCalendar = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar/subscribe`,
        {
          headers: getAuthHeaders(session?.access_token ?? null),
        },
      );
      if (!response.ok) throw new Error('Failed to get subscribe link');
      const { url } = await response.json();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Subscription Error:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchTasks = async () => {
      if (mockTasks) return;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/staff/tasks`, {
          headers: getAuthHeaders(session?.access_token ?? null),
        });
        if (res.ok) {
          const data = (await res.json()) as KanbanTask[];
          const mappedData = data.map((task: KanbanTask) => ({
            ...task,
            columnId: task.column_id ?? 'idea',
          }));
          if (!ignore) setTasks(mappedData);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchTasks();
    return () => {
      ignore = true;
    };
  }, [mockTasks]);

  const handleCreateTask = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    if (
      newTask.due_date &&
      newTask.end_date &&
      new Date(newTask.end_date) < new Date(newTask.due_date)
    ) {
      setDateError(
        t(
          'admin.staff_hub.kanban.create_modal.date_error',
          'La fecha de fin no puede ser anterior a la de inicio',
        ),
      );
      return;
    }
    setDateError(null);

    const taskPayload = {
      ...newTask,
      assignee: newTask.assignee || 'Unassigned',
      column_id: 'idea',
      date: newTask.due_date
        ? new Date(newTask.due_date).toLocaleDateString()
        : new Date().toLocaleDateString(),
      due_date: newTask.due_date || null,
      end_date: newTask.end_date || null,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/staff/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token ?? null),
        },
        body: JSON.stringify(taskPayload),
      });

      if (res.ok) {
        const savedTask = await res.json();
        setTasks((prev) => [{ ...savedTask, columnId: savedTask.column_id || 'idea' }, ...prev]);
        setShowCreateModal(false);
        setNewTask({
          title: '',
          priority: 'Medium',
          type: 'General',
          assignee: '',
          due_date: '',
          end_date: '',
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskDate = async (id: number | string, newDate: Date) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token ?? null),
        },
        body: JSON.stringify({
          due_date: newDate.toISOString(),
          date: newDate.toLocaleDateString(),
        }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    }
  };

  const handleUpdateTaskDuration = async (id: number | string, start: Date, end: Date) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token ?? null),
        },
        body: JSON.stringify({
          due_date: start.toISOString(),
          end_date: end.toISOString(),
          date: start.toLocaleDateString(),
        }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating task duration:', error);
    }
  };

  const handleEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      priority: task.priority ?? 'Medium',
      type: task.type ?? 'General',
      assignee: task.assignee ?? '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      end_date: task.end_date ? new Date(task.end_date).toISOString().slice(0, 16) : '',
    });
    setShowCreateModal(true);
  };

  const handleSaveTask = async () => {
    if (!editingTask) return;

    if (
      newTask.due_date &&
      newTask.end_date &&
      new Date(newTask.end_date) < new Date(newTask.due_date)
    ) {
      setDateError(
        t(
          'admin.staff_hub.kanban.create_modal.date_error',
          'La fecha de fin no puede ser anterior a la de inicio',
        ),
      );
      return;
    }
    setDateError(null);

    const taskPayload = {
      ...newTask,
      due_date: newTask.due_date || null,
      end_date: newTask.end_date || null,
      date: newTask.due_date
        ? new Date(newTask.due_date).toLocaleDateString()
        : new Date().toLocaleDateString(),
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/staff/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token ?? null),
        },
        body: JSON.stringify(taskPayload),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' }
              : t,
          ),
        );
        setShowCreateModal(false);
        setEditingTask(null);
        setNewTask({
          title: '',
          priority: 'Medium',
          type: 'General',
          assignee: '',
          due_date: '',
          end_date: '',
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`${API_URL}/staff/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(session?.access_token ?? null),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasks(previousTasks);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onDrop = async (e: React.DragEvent, columnId: string) => {
    const cardId = e.dataTransfer.getData('cardId');

    const taskToUpdate = tasks.find((t) => t.id === Number(cardId));
    if (!taskToUpdate || taskToUpdate.columnId === columnId) return;

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === Number(cardId)) {
          return { ...task, columnId };
        }
        return task;
      }),
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`${API_URL}/staff/tasks/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token ?? null),
        },
        body: JSON.stringify({ column_id: columnId }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setTasks(previousTasks);
    }
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setNewTask({
      title: '',
      priority: 'Medium',
      type: 'General',
      assignee: '',
      due_date: '',
      end_date: '',
    });
    setShowCreateModal(true);
  };

  const closeTaskModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
  };

  return {
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
  };
}
