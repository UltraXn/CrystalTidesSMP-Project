import type { Meta, StoryObj } from '@storybook/react';
import SocialSidebar from '../../components/Layout/SocialSidebar';

const meta: Meta<typeof SocialSidebar> = {
  title: 'Layout/SocialSidebar',
  component: SocialSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SocialSidebar>;

export const FloatingSocialIcons: Story = {
  render: () => (
    <div style={{ height: '300px', width: '300px', background: '#0b0c10', position: 'relative' }}>
      <SocialSidebar />
    </div>
  ),
};
