import type { Meta, StoryObj } from '@storybook/react';
import { WikiCompanion3DCard } from '../../components/Wiki/WikiCompanion3DCard';

const meta: Meta<typeof WikiCompanion3DCard> = {
  title: 'Wiki/WikiCompanion3DCard',
  component: WikiCompanion3DCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiCompanion3DCard>;

export const RedPandaCompanion: Story = {
  args: {
    bossName: 'Oso Panda Rojo del Bosque',
    subtitle: 'Mascota Fiel y Acompañante de Reino',
    hp: '20 HP (10 Corazones)',
    speed: '0.35 (Rápido y Ágil)',
    location: 'Bosques Abisales y Colinas Templadas',
    description: 'El **Panda Rojo Abisal** acompaña a los jugadores en sus expediciones aumentando la velocidad de recolección de bayas.',
    tamingItems: ['Bambú de Cristal', 'Bayas Dulces'],
    drops: ['1x Piel Suave de Cristal', 'Bambú'],
  },
};
