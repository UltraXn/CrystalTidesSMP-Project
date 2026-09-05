import type { Meta, StoryObj } from '@storybook/react';
import Hero from '../../components/Hero/index';

const meta: Meta<typeof Hero> = {
  title: 'Hero/HeroSection',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const OnlineServerWithPlayers: Story = {
  args: {
    mockPlayerCount: 64,
    mockIsOnline: true,
    mockSlides: [
      {
        image: '/images/backgrounds/hero-bg-1.webp',
        title: 'Temporada IV: Abismos Olvidados',
        text: 'Enfréntate a las criaturas del abismo y reclama armas legendarias.',
        buttonText: 'Unirse al Servidor',
        link: '/play'
      },
      {
        image: '/images/backgrounds/hero-bg-2.webp',
        title: 'Nuevo Jefe: Ignis de Cataclysm',
        text: 'Una nueva mazmorra infernal te espera en las profundidades del Nether.',
        buttonText: 'Ver en la Wiki',
        link: '/wiki'
      }
    ]
  }
};

export const MaintenanceOfflineState: Story = {
  args: {
    mockPlayerCount: 0,
    mockIsOnline: false,
    mockSlides: [
      {
        image: '/images/backgrounds/hero-bg-3.webp',
        title: 'Mantenimiento Programado',
        text: 'Estamos optimizando los mundos e instalando el nuevo parche de bosses.'
      }
    ]
  }
};
