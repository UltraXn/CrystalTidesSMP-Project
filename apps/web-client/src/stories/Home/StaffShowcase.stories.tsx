import type { Meta, StoryObj } from '@storybook/react';
import StaffShowcase from '../../components/Home/StaffShowcase';

const meta: Meta<typeof StaffShowcase> = {
  title: 'Home/StaffShowcase',
  component: StaffShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffShowcase>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#0b0c10', minHeight: '100vh', padding: '2rem 0' }}>
      <StaffShowcase />
    </div>
  )
};
