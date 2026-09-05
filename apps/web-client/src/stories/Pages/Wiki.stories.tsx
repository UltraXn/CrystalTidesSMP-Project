import type { Meta, StoryObj } from '@storybook/react';
import Wiki from '../../pages/Wiki';

const meta = {
  title: 'Pages/Wiki',
  component: Wiki,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Wiki>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
