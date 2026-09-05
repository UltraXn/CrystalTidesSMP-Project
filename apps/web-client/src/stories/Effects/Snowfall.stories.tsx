import type { Meta, StoryObj } from '@storybook/react';
import Snowfall from '../../components/Effects/Snowfall';

const meta: Meta<typeof Snowfall> = {
  title: 'Effects/Snowfall',
  component: Snowfall,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Snowfall>;

export const WinterEventSnowfall: Story = {
  render: () => (
    <div style={{ minHeight: '500px', background: 'linear-gradient(180deg, #0b0c10 0%, #1a1f35 100%)', position: 'relative' }}>
      <Snowfall />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, textShadow: '0 0 20px rgba(56,189,248,0.5)' }}>
          ❄️ Evento de Invierno Activo
        </h2>
      </div>
    </div>
  ),
};
