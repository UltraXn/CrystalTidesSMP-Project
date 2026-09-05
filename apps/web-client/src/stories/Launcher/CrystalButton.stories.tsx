import type { Meta, StoryObj } from '@storybook/react';
import { CrystalButton } from '../../components/Launcher/CrystalButton';

const meta: Meta<typeof CrystalButton> = {
  title: 'Launcher/CrystalButton',
  component: CrystalButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CrystalButton>;

export const PrimaryPlay: Story = {
  args: {
    text: 'INICIAR MINECRAFT 1.21.1',
    variant: 'primary',
    size: 'lg',
    icon: '▶',
    onPressed: () => {},
  },
};

export const SecondarySettings: Story = {
  args: {
    text: 'Ajustes del Cliente',
    variant: 'secondary',
    size: 'md',
    icon: '⚙️',
    onPressed: () => {},
  },
};

export const DangerPurgeCache: Story = {
  args: {
    text: 'Purgar Cache de Mods',
    variant: 'danger',
    size: 'md',
    icon: '🗑️',
    onPressed: () => {},
  },
};
