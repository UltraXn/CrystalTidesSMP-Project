import type { Meta, StoryObj } from '@storybook/react';
import Loader from '../../components/UI/Loader';

const meta: Meta<typeof Loader> = {
  title: 'UI/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    minimal: { control: 'boolean' },
    size: { control: { type: 'range', min: 16, max: 120, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const DefaultPrism: Story = {
  args: {
    text: 'Cargando assets y modelos de CrystalTides...',
  },
};

export const MinimalSpinner: Story = {
  args: {
    minimal: true,
    text: 'Sincronizando saldo...',
    size: 36,
  },
};

export const LargeMinimalSpinner: Story = {
  args: {
    minimal: true,
    text: 'Conectando con el servidor de autenticación...',
    size: 64,
  },
};
