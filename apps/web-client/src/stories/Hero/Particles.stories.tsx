import type { Meta, StoryObj } from '@storybook/react';
import HeroParticles from '../../components/Hero/Particles';

const meta: Meta<typeof HeroParticles> = {
  title: 'Hero/Particles',
  component: HeroParticles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeroParticles>;

export const FloatingAmbientParticles: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '400px', background: '#05070e', position: 'relative', overflow: 'hidden' }}>
      <HeroParticles />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#89D9D1', fontFamily: 'monospace' }}>
        Partículas GSAP flotantes de fondo
      </div>
    </div>
  )
};
