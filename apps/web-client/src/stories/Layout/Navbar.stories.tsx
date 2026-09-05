import type { Meta, StoryObj } from '@storybook/react';
import Navbar from '../../components/Layout/Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const DefaultNavbar: Story = {
  render: () => (
    <div style={{ minHeight: '300px', background: '#090a10', position: 'relative' }}>
      <Navbar />
      <div style={{ padding: '6rem 2rem 2rem 2rem', color: '#666', textAlign: 'center' }}>
        <p>Contenido debajo de la barra de navegación principal.</p>
      </div>
    </div>
  )
};
