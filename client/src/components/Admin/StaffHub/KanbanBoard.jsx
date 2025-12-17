import React, { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import { FaPlus } from 'react-icons/fa';

const MOCK_DATA = [
    { id: 't1', title: 'Review Whitelist App #402', priority: 'High', type: 'Whitelist', assignee: 'Killu', columnId: 'pending', date: 'Oct 24' },
    { id: 't2', title: 'Fix Spawn Holo Glitch', priority: 'Medium', type: 'Bug', assignee: 'Nero', columnId: 'in_progress', date: 'Oct 25' },
    { id: 't3', title: 'Plan Xmas Event', priority: 'Low', type: 'Event', assignee: 'Staff', columnId: 'idea', date: 'Nov 01' },
    { id: 't4', title: 'Ban Appeal: xX_Gamer_Xx', priority: 'High', type: 'Appeal', assignee: 'ModTeam', columnId: 'done', date: 'Oct 20' },
];

const COLUMNS = [
    { id: 'idea', title: 'Ideas / Backlog', color: '#a855f7' },
    { id: 'pending', title: 'Pendiente', color: '#facc15' },
    { id: 'in_progress', title: 'En Progreso', color: '#3b82f6' },
    { id: 'review', title: 'Revisión', color: '#f97316' },
    { id: 'done', title: 'Completado', color: '#22c55e' }
];

export default function KanbanBoard() {
    // Load from local storage or mock
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('crystal_kanban_tasks');
        return saved ? JSON.parse(saved) : MOCK_DATA;
    });

    useEffect(() => {
        localStorage.setItem('crystal_kanban_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const onDragStart = (e, cardId) => {
        e.dataTransfer.setData("cardId", cardId);
    };

    const onDrop = (e, columnId) => {
        const cardId = e.dataTransfer.getData("cardId");
        
        setTasks(prev => prev.map(task => {
            if (task.id === cardId) {
                return { ...task, columnId };
            }
            return task;
        }));
    };

    const addNewTask = () => {
        const title = prompt("Nueva Tarea:");
        if(!title) return;
        
        const newTask = {
            id: `t-${Date.now()}`,
            title,
            priority: 'Medium',
            type: 'General',
            assignee: 'Unassigned',
            columnId: 'idea',
            date: new Date().toLocaleDateString()
        };
        setTasks([...tasks, newTask]);
    };

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
