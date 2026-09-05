import type { Meta, StoryObj } from '@storybook/react';
import Section from '../../components/Layout/Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Section>;

export const AnimatedSectionWithTitle: Story = {
  args: {
    title: '👑 JEFES Y MAZMORRAS IMPERIALES',
    headingLevel: 'h2',
    direction: 'up',
    separator: true,
    children: (
      <div style={{ background: '#12141c', padding: '2rem', borderRadius: '12px', color: '#ccc', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p>Explora las diferentes áreas del mundo y enfréntate a las criaturas más letales de Cataclysm.</p>
      </div>
    )
  }
};

export const WithoutSeparator: Story = {
  args: {
    title: 'REGLAS DEL SERVIDOR',
    headingLevel: 'h2',
    direction: 'left',
    separator: false,
    children: (
      <div style={{ background: '#12141c', padding: '1.5rem', borderRadius: '8px', color: '#aaa' }}>
        <p>1. Respeto mutuo y juego limpio entre todos los clanes.</p>
      </div>
    )
  }
};
