import type { Meta, StoryObj } from '@storybook/react';
import HalloweenPop from '../../components/Effects/HalloweenPop';

const meta: Meta<typeof HalloweenPop> = {
  title: 'Effects/HalloweenPop',
  component: HalloweenPop,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HalloweenPop>;

export const HalloweenEventPumpkins: Story = {
  render: () => (
    <div style={{ minHeight: '500px', background: 'linear-gradient(180deg, #1a0a2e 0%, #0b0c10 100%)', position: 'relative' }}>
      <HalloweenPop />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
        <h2 style={{ color: '#F97316', fontSize: '2rem', fontWeight: 800, textShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
          🎃 Evento de Halloween Activo
        </h2>
      </div>
    </div>
  ),
};
