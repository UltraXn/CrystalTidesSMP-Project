import type { Meta, StoryObj } from '@storybook/react';
import ForgotPassword from '../../pages/ForgotPassword';

const meta = {
  title: 'Pages/ForgotPassword',
  component: ForgotPassword,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ForgotPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
