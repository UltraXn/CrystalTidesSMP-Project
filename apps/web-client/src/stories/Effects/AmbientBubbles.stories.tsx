import type { Meta, StoryObj } from '@storybook/react';
import AmbientBubbles from '../../components/Effects/AmbientBubbles';

const meta: Meta<typeof AmbientBubbles> = {
  title: 'Effects/AmbientBubbles',
  component: AmbientBubbles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AmbientBubbles>;

export const AmbientWaterBackground: Story = {
  render: () => (
    <div style={{ height: '400px', background: 'linear-gradient(180deg, #05070e 0%, #032b30 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AmbientBubbles />
      <span style={{ color: '#5eead4', fontFamily: 'monospace', zIndex: 2 }}>Burbujas acuáticas subiendo continuamente</span>
    </div>
  )
};
