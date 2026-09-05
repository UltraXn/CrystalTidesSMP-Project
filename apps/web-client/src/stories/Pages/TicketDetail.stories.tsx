import type { Meta, StoryObj } from '@storybook/react';
import TicketDetail from '../../pages/TicketDetail';

const meta = {
  title: 'Pages/TicketDetail',
  component: TicketDetail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TicketDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
