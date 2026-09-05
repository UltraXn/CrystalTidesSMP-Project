import type { Meta, StoryObj } from '@storybook/react';
import KanbanBoard from '../../../components/Admin/StaffHub/KanbanBoard';
import { KanbanTask } from '@crystaltides/shared';

const mockTasks: KanbanTask[] = [
  {
    id: 1,
    title: 'Actualizar balance de daño de Ignis Fase 2',
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
    title: 'Auditoría de seguridad y parches de RLS',
    column_id: 'in_progress',
    columnId: 'in_progress',
    priority: 'High',
    assignee: 'Killu',
    type: 'Seguridad',
    due_date: '2026-08-16T12:00:00Z',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Preparar evento de Guerra de Clanes en el End',
    column_id: 'idea',
    columnId: 'idea',
    priority: 'Medium',
    assignee: 'CrystalStaff',
    type: 'Eventos',
    due_date: '2026-08-30',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Despliegue de nuevo launcher v2.4.0',
    column_id: 'done',
    columnId: 'done',
    priority: 'Low',
    assignee: 'NeroFerno',
    type: 'Launcher',
    due_date: '2026-08-10T20:00:00Z',
    created_at: new Date().toISOString()
  }
];

const meta: Meta<typeof KanbanBoard> = {
  title: 'Admin/StaffHub/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const PopulatedStaffBoard: Story = {
  args: {
    mockTasks: mockTasks,
    mockGoogleEvents: [
      { id: 'ev-1', summary: 'Reunión de Staff Semanal', start: { dateTime: '2026-08-15T18:00:00Z' }, end: { dateTime: '2026-08-15T19:00:00Z' } },
      { id: 'ev-2', summary: 'Mantenimiento del Servidor', start: { dateTime: '2026-08-18T04:00:00Z' }, end: { dateTime: '2026-08-18T06:00:00Z' } }
    ]
  }
};

export const EmptyBoard: Story = {
  args: {
    mockTasks: [],
    mockGoogleEvents: []
  }
};
