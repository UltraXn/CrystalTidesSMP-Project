import type { Meta, StoryObj } from '@storybook/react';
import SiteConfig from '../../components/Admin/SiteConfig';

const meta: Meta<typeof SiteConfig> = {
  title: 'Admin/SiteConfig',
  component: SiteConfig,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SiteConfig>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <SiteConfig />
    </div>
  )
};
