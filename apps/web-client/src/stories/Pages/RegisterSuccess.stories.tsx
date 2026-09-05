import type { Meta, StoryObj } from '@storybook/react';
import RegisterSuccess from '../../pages/RegisterSuccess';

const meta = {
  title: 'Pages/RegisterSuccess',
  component: RegisterSuccess,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RegisterSuccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
