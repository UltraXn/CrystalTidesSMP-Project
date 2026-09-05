import type { Meta, StoryObj } from '@storybook/react';
import KanbanColumn from '../../../components/Admin/StaffHub/KanbanColumn';
import { KanbanTask } from '@crystaltides/shared';

const mockCards: KanbanTask[] = [
  {
    id: 1,
    title: 'Actualizar balance de daño de Ignis',
    column_id: 'todo',
    columnId: 'todo',
    priority: 'High',
    assignee: 'NeroFerno',
    type: 'Balance',
    due_date: '2026-08-20T18:00:00Z',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Revisión de permisos de Staff',
    column_id: 'todo',
    columnId: 'todo',
    priority: 'Medium',
    assignee: 'Killu',
    type: 'Permisos',
    due_date: '2026-08-22',
    created_at: new Date().toISOString()
  }
];

const meta: Meta<typeof KanbanColumn> = {
  title: 'Admin/StaffHub/KanbanColumn',
  component: KanbanColumn,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanColumn>;

export const TodoColumn: Story = {
  args: {
    column: { id: 'todo', title: 'Por Hacer', color: '#3b82f6' },
    cards: mockCards,
    onDragStart: (_e, id) => { console.log('Drag card:', id); },
    onDrop: (_e, colId) => { console.log('Drop in column:', colId); },
    onDelete: (id) => { console.log('Delete task:', id); },
    onEdit: (task) => { console.log('Edit task:', task); }
  }
};

export const InProgressColumn: Story = {
  args: {
    column: { id: 'in_progress', title: 'En Progreso', color: '#f59e0b' },
    cards: [
      {
        id: 3,
        title: 'Auditoría de seguridad y parches de RLS',
        column_id: 'in_progress',
        columnId: 'in_progress',
        priority: 'High',
        assignee: 'Killu',
        type: 'Seguridad',
        due_date: '2026-08-16T12:00:00Z',
        created_at: new Date().toISOString()
      }
    ],
    onDragStart: () => {},
    onDrop: () => {},
    onDelete: () => {},
    onEdit: () => {}
  }
};
