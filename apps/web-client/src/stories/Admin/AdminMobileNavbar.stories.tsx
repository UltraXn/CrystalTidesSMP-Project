import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AdminMobileNavbar from '../../components/Admin/AdminMobileNavbar';

const meta: Meta<typeof AdminMobileNavbar> = {
  title: 'Admin/Navigation/AdminMobileNavbar',
  component: AdminMobileNavbar,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminMobileNavbar>;

function InteractiveMobileNavbarComponent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ position: 'relative', height: '180px', background: '#090a10', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>
        Pestaña activa: <strong style={{ color: '#38bdf8' }}>{activeTab}</strong> | Menú lateral: <strong style={{ color: sidebarOpen ? '#4ade80' : '#f87171' }}>{sidebarOpen ? 'Abierto' : 'Cerrado'}</strong>
      </div>
      <AdminMobileNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
}

export const InteractiveMobileBottomBar: Story = {
  render: () => <InteractiveMobileNavbarComponent />
};
