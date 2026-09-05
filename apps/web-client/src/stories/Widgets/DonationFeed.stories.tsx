import type { Meta, StoryObj } from '@storybook/react';
import DonationFeed from '../../components/Widgets/DonationFeed';

const meta: Meta<typeof DonationFeed> = {
  title: 'Widgets/DonationFeed',
  component: DonationFeed,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonationFeed>;

export const LiveSupportStream: Story = {
  args: {
    mockDonations: [
      {
        id: '1',
        from_name: 'KilluBysmali',
        amount: '50.00',
        currency: 'USD',
        created_at: new Date().toISOString(),
        message: '¡Gracias por mantener vivo el servidor CrystalTides! 🚀💎',
        is_public: true,
      },
      {
        id: '2',
        from_name: 'Neroferno',
        amount: '25.00',
        currency: 'USD',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        message: 'Apoyo para los servidores de alta latencia y mods de la dimensión.',
        is_public: true,
      },
      {
        id: '3',
        from_name: 'JugadorAnónimo',
        amount: '10.00',
        currency: 'USD',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        message: '¡Por más eventos de bosses y guerras de reinos!',
        is_public: true,
      },
    ],
  },
};
