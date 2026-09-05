import type { Meta, StoryObj } from '@storybook/react';
import { CrystalPageHeader } from '../../components/Launcher/CrystalPageHeader';

const meta: Meta<typeof CrystalPageHeader> = {
  title: 'Launcher/CrystalPageHeader',
  component: CrystalPageHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    eyebrow: { control: 'text' },
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CrystalPageHeader>;

export const ModManagerHeader: Story = {
  args: {
    eyebrow: 'Gestión de Mods',
    title: 'Administrador de Modpack',
  },
};

export const SettingsHeader: Story = {
  args: {
    eyebrow: 'Configuración',
    title: 'Ajustes del Launcher',
    trailing: <button style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>,
  },
};
