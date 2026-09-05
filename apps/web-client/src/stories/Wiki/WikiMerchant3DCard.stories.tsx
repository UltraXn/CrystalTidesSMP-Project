import type { Meta, StoryObj } from '@storybook/react';
import { WikiMerchant3DCard } from '../../components/Wiki/WikiMerchant3DCard';

const meta: Meta<typeof WikiMerchant3DCard> = {
  title: 'Wiki/WikiMerchant3DCard',
  component: WikiMerchant3DCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiMerchant3DCard>;

export const RibbitMerchant: Story = {
  args: {
    bossName: 'Ribbit Mercader',
    subtitle: 'Mercader Ambulante del Pantano',
    hp: '30 HP (Protegido por Escudo Mágico)',
    currency: 'KilluCoins (KC) / Esmeraldas',
    location: 'Pantanos y Manglares — Aparece cada 3 días',
    description: 'Un anfibio comerciante que recorre los pantanos vendiendo objetos raros a cambio de KilluCoins. Ofrece encantamientos exclusivos y materiales de Cristal.',
    trades: [
      'Cristal de Maestría × 1 → 500 KC',
      'Libro de Encantamiento Abisal → 200 KC',
      'Mapa del Tesoro Oculto → 150 KC',
      'Poción de Velocidad III → 80 KC',
    ],
  },
};
