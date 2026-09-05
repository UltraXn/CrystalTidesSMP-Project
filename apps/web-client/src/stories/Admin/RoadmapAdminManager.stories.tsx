import type { Meta, StoryObj } from '@storybook/react';
import RoadmapAdminManager from '../../components/Admin/RoadmapAdminManager';

const meta: Meta<typeof RoadmapAdminManager> = {
  title: 'Admin/RoadmapAdminManager',
  component: RoadmapAdminManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RoadmapAdminManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <RoadmapAdminManager />
    </div>
  )
};
