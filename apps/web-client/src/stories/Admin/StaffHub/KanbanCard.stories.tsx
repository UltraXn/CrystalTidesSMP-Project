import type { Meta, StoryObj } from '@storybook/react';
import KanbanCard from '../../../components/Admin/StaffHub/KanbanCard';
import { KanbanTask } from '@crystaltides/shared';

const mockCard: KanbanTask = {
  id: 101,
  title: 'Corregir exploit de duplicación de Killucoins',
  column_id: 'todo',
  columnId: 'todo',
  priority: 'High',
  assignee: 'NeroFerno',
  type: 'BugFix',
  due_date: '2026-08-15T23:59:00Z',
  created_at: new Date().toISOString()
};

const meta: Meta<typeof KanbanCard> = {
  title: 'Admin/StaffHub/KanbanCard',
  component: KanbanCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanCard>;

export const UrgentPriorityCard: Story = {
  args: {
    card: mockCard,
    onDragStart: (_e, id) => { console.log('Drag card:', id); },
    onDelete: (id) => { console.log('Delete card:', id); },
    onEdit: (task) => { console.log('Edit task:', task); }
  }
};

export const HighPriorityCard: Story = {
  args: {
    card: {
      ...mockCard,
      id: 102,
      title: 'Crear mazmorra de hielo para Frostmaw',
      priority: 'High',
      type: 'Diseño RPG',
      assignee: 'Killu'
    },
    onDragStart: () => {},
    onDelete: () => {},
    onEdit: () => {}
  }
};

export const MediumPriorityCard: Story = {
  args: {
    card: {
      ...mockCard,
      id: 103,
      title: 'Actualizar imágenes de la Wiki de Armas',
      priority: 'Medium',
      type: 'Wiki',
      assignee: 'Alex'
    },
    onDragStart: () => {},
    onDelete: () => {},
    onEdit: () => {}
  }
};
