import type { Meta, StoryObj } from '@storybook/react';
import TypingBubbles from '../../components/Effects/TypingBubbles';

const meta: Meta<typeof TypingBubbles> = {
  title: 'Effects/TypingBubbles',
  component: TypingBubbles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TypingBubbles>;

export const InteractiveTypingDemo: Story = {
  render: () => (
    <div style={{ height: '350px', background: '#090a10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <TypingBubbles />
      <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Escribe en el teclado para generar burbujas</h3>
      <input
        type="text"
        placeholder="Presiona cualquier tecla aquí..."
        style={{
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(56,189,248,0.4)',
          borderRadius: '8px',
          color: '#fff',
          width: '320px',
          fontSize: '1rem',
          textAlign: 'center'
        }}
      />
    </div>
  )
};
