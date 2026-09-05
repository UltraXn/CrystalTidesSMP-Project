import type { Meta, StoryObj } from '@storybook/react';
import { WikiHostile3DCard } from '../../components/Wiki/WikiHostile3DCard';

const meta: Meta<typeof WikiHostile3DCard> = {
  title: 'Wiki/WikiHostile3DCard',
  component: WikiHostile3DCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiHostile3DCard>;

export const ChupacabraHostile: Story = {
  args: {
    bossName: 'Chupacabra Abisal',
    subtitle: 'Mob Hostil Nocturno',
    hp: '40 HP (20 Corazones)',
    damage: '8 HP por ataque',
    speed: '0.45 (Rápido)',
    location: 'Cuevas Profundas y Llanuras Nocturnas',
    spawnMethod: 'Spawn natural en luna nueva',
    description: 'Criatura mitológica que acecha a los jugadores durante las noches sin luna. Ataca en manada y drena vida.',
    drops: ['1x Colmillo de Cristal', '2x Cuero Oscuro', '50 KC'],
    kcReward: 50,
  },
};
