import type { Meta, StoryObj } from '@storybook/react';
import { PriorityBadge, StatusBadge, CustomAlert, CustomConfirm } from '../../../components/Admin/Tickets/Shared';

const meta: Meta = {
  title: 'Admin/Tickets/TicketSharedBadges',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const AllPriorityBadges: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', background: '#12141c', padding: '1.5rem', borderRadius: '10px' }}>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Baja:</span><PriorityBadge priority="low" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Media:</span><PriorityBadge priority="medium" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Alta:</span><PriorityBadge priority="high" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Urgente:</span><PriorityBadge priority="urgent" /></div>
    </div>
  )
};

export const AllStatusBadges: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', background: '#12141c', padding: '1.5rem', borderRadius: '10px' }}>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Abierto:</span><StatusBadge status="open" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Pendiente:</span><StatusBadge status="pending" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Resuelto:</span><StatusBadge status="resolved" /></div>
      <div><span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Cerrado:</span><StatusBadge status="closed" /></div>
    </div>
  )
};

export const CustomAlertModal: StoryObj = {
  render: () => (
    <CustomAlert
      message="Se ha producido un error al sincronizar las tablas de moderación con el servidor."
      type="error"
      onClose={() => console.log('Close alert')}
    />
  )
};

export const CustomConfirmModal: StoryObj = {
  render: () => (
    <CustomConfirm
      message="¿Estás seguro de que deseas revocar los permisos de Staff de este usuario?"
      onConfirm={() => console.log('Confirm action')}
      onCancel={() => console.log('Cancel action')}
    />
  )
};
