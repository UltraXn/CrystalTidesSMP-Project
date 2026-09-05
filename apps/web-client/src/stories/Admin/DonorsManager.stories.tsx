import type { Meta, StoryObj } from '@storybook/react';
import DonorsManager from '../../components/Admin/DonorsManager';

const meta: Meta<typeof DonorsManager> = {
  title: 'Admin/DonorsManager',
  component: DonorsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorsManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <DonorsManager />
    </div>
  )
};
