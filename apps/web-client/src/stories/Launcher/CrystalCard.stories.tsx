import type { Meta, StoryObj } from '@storybook/react';
import { CrystalCard } from '../../components/Launcher/CrystalCard';

const meta: Meta<typeof CrystalCard> = {
  title: 'Launcher/CrystalCard',
  component: CrystalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CrystalCard>;

export const GlassContainerCard: Story = {
  render: () => (
    <CrystalCard enableHoverEffect={true} style={{ width: '320px', padding: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Módulo de Seguridad</h3>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
        Verificación de firma de jar de modpack y encriptación de sesión activada.
      </p>
    </CrystalCard>
  ),
};
