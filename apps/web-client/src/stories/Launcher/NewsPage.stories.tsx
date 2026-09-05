import type { Meta, StoryObj } from '@storybook/react';
import { NewsPage } from '../../components/Launcher/NewsPage';

const meta: Meta<typeof NewsPage> = {
  title: 'Launcher/NewsPage',
  component: NewsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NewsPage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <NewsPage />
    </div>
  )
};
