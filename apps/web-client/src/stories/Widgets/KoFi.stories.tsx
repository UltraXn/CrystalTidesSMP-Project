import type { Meta, StoryObj } from '@storybook/react';
import { KoFiButton } from '../../components/Widgets/KoFi';

const meta: Meta<typeof KoFiButton> = {
  title: 'Widgets/KoFiButton',
  component: KoFiButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KoFiButton>;

export const Default: Story = {
  args: {
    kofiId: 'G2G03Y8FL',
    text: '¡Dona por Ko-Fi a CrystalTides!',
  }
};

export const CustomText: Story = {
  args: {
    kofiId: 'G2G03Y8FL',
    text: '☕ Apoyar desarrollo del Servidor',
  }
};
