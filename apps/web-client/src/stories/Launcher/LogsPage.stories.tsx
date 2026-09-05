import type { Meta, StoryObj } from '@storybook/react';
import { LogsPage } from '../../components/Launcher/LogsPage';

const meta: Meta<typeof LogsPage> = {
  title: 'Launcher/LogsPage',
  component: LogsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LogsPage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <LogsPage />
    </div>
  )
};
