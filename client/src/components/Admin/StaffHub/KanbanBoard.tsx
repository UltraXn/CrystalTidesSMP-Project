import React, { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import { FaPlus } from 'react-icons/fa';
import { KanbanTask } from './KanbanCard';

const API_URL = import.meta.env.VITE_API_URL;

const COLUMNS = [
    { id: 'idea', title: 'Ideas / Backlog', color: '#a855f7' },
    { id: 'pending', title: 'Pendiente', color: '#facc15' },
    { id: 'in_progress', title: 'En Progreso', color: '#3b82f6' },
    { id: 'review', title: 'Revisión', color: '#f97316' },
    { id: 'done', title: 'Completado', color: '#22c55e' }
];

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<KanbanTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_URL}/staff/tasks`);
            if (res.ok) {
                const data = await res.json() as KanbanTask[];
                // Map database fields to frontend fields if necessary
                const mappedData = data.map((task: any) => ({
                    ...task,
                    columnId: task.column_id || 'idea' // database uses column_id
                }));
                setTasks(mappedData);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const onDragStart = (e: React.DragEvent, cardId: number) => {
        e.dataTransfer.setData("cardId", cardId.toString());
    };

    const onDrop = async (e: React.DragEvent, columnId: string) => {
        const cardId = e.dataTransfer.getData("cardId");
        
        // Optimistic UI update
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
            await fetch(`${API_URL}/staff/tasks/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ column_id: columnId }) // Send database field name
            });
        } catch (error) {
            console.error("Error updating task:", error);
            setTasks(previousTasks); // Revert on error
        }
    };

    const addNewTask = async () => {
        const title = prompt("Nueva Tarea:");
        if (!title) return;
        
        const newTask = {
            title,
            priority: 'Medium',
            type: 'General',
            assignee: 'Unassigned',
            column_id: 'idea',
            date: new Date().toLocaleDateString()
        };

        try {
            const res = await fetch(`${API_URL}/staff/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if (res.ok) {
                const savedTask = await res.json();
                setTasks(prev => [...prev, { ...savedTask, columnId: savedTask.column_id }]);
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    if (loading) return <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Cargando tablero...</div>;

    return (
        <div className="kanban-board-container" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#ccc' }}>Tablero de Tareas</h3>
                <button 
                    onClick={addNewTask}
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FaPlus /> Nueva Tarea
                </button>
            </div>

            <div style={{ 
                flex: 1, 
                display: 'flex', 
                gap: '1rem', 
                overflowX: 'auto', 
                paddingBottom: '1rem' 
            }}>
                {COLUMNS.map(col => (
                    <KanbanColumn 
                        key={col.id} 
                        column={col} 
                        cards={tasks.filter(t => t.columnId === col.id)}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                    />
                ))}
            </div>
        </div>
    );
}
