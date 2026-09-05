import type { Meta, StoryObj } from '@storybook/react';
import AuditLog from '../../components/Admin/AuditLog';

const mockAuditEntries = [
  {
    id: 'log-01',
    created_at: new Date(Date.now() - 600000).toISOString(),
    username: 'NeroFerno',
    action: 'UPDATE_ROLE',
    details: 'Ascendió al jugador Steve a Staff',
    source: 'web'
  },
  {
    id: 'log-02',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    username: 'SecurityEngine',
    action: 'HONEYPOT_TRIGGER',
    details: 'Bloqueó IP 192.168.1.100 por sondeo de /wp-login.php',
    source: 'security'
  },
  {
    id: 'log-03',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    username: 'CrystalBot',
    action: 'REWARD_CLAIM',
    details: 'Otorgó 500 Killucoins por voto diario en Minecraft MP',
    source: 'game'
  },
  {
    id: 'log-04',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    username: 'Killu',
    action: 'WIKI_UPDATE',
    details: 'Editó estadísticas de daño de Ignis Fase 2',
    source: 'web'
  }
];

const meta: Meta<typeof AuditLog> = {
  title: 'Admin/Logs/AuditLog',
  component: AuditLog,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuditLog>;

export const PopulatedAuditLog: Story = {
  args: {
    mockLogs: mockAuditEntries,
    mockTotal: 4
  }
};

export const EmptyAuditLog: Story = {
  args: {
    mockLogs: [],
    mockTotal: 0
  }
};
