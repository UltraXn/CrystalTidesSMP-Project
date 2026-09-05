import type { Meta, StoryObj } from '@storybook/react';
import CalendarView from '../../../components/Admin/StaffHub/CalendarView';
import { KanbanTask } from '@crystaltides/shared';

const mockTasks: KanbanTask[] = [
  {
    id: 1,
    title: 'Lanzamiento de la Temporada 3',
    column_id: 'todo',
    columnId: 'todo',
    priority: 'High',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Mantenimiento del Servidor y Backup',
    column_id: 'in_progress',
    columnId: 'in_progress',
    priority: 'High',
    due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    created_at: new Date().toISOString()
  }
];

const meta: Meta<typeof CalendarView> = {
  title: 'Admin/StaffHub/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

export const Default: Story = {
  args: {
    tasks: mockTasks,
    googleEvents: [
      {
        id: 'g-1',
        summary: 'Reunión de Staff en Discord',
        start: { dateTime: new Date(Date.now() + 3600000 * 3).toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000 * 4).toISOString() }
      }
    ],
    onEditTask: (task) => console.log('Edit task:', task),
    onUpdateEventDate: (id, date) => console.log('Update event date:', id, date),
    onUpdateEventDuration: (id, start, end) => console.log('Update event duration:', id, start, end)
  }
};
