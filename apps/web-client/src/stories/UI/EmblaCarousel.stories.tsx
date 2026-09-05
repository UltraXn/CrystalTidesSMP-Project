import type { Meta, StoryObj } from '@storybook/react';
import EmblaCarousel from '../../components/UI/EmblaCarousel';
import RoleBadge from '../../components/User/RoleBadge';

const meta: Meta<typeof EmblaCarousel> = {
  title: 'UI/EmblaCarousel',
  component: EmblaCarousel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmblaCarousel>;

export const StaffCarousel: Story = {
  args: {
    slides: [
      {
        name: 'KilluBysmali',
        image: 'KilluBysmali',
        rank: <RoleBadge role="staff" />,
        description: 'Fundador y Desarrollador Principal de CrystalTides SMP.',
      },
      {
        name: 'Neroferno',
        image: 'Neroferno',
        rank: <RoleBadge role="admin" />,
        description: 'Administrador de Servidor y Creador de Eventos.',
      },
      {
        name: 'UltraXn',
        image: 'UltraXn',
        rank: <RoleBadge role="developer" />,
        description: 'Desarrollador de Plugins e Infraestructura.',
      },
    ],
  },
};
