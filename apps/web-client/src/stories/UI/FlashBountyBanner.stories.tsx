import type { Meta, StoryObj } from '@storybook/react';
import { FlashBountyBanner } from '../../components/UI/FlashBountyBanner';

const meta: Meta<typeof FlashBountyBanner> = {
  title: 'UI/FlashBountyBanner',
  component: FlashBountyBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlashBountyBanner>;

export const Default: Story = {};

export const WithinPageHeader: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <FlashBountyBanner />
      <div style={{ padding: '2rem', background: '#12141c', borderRadius: '16px', border: '1px solid #222' }}>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>CrystalTides SMP — Inicio</h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Bienvenido al mundo custom RPG y dimensional.</p>
      </div>
    </div>
  ),
};
