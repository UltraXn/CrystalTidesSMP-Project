import type { Meta, StoryObj } from '@storybook/react';
import { ModManagerPage } from '../../components/Launcher/ModManagerPage';

const meta: Meta<typeof ModManagerPage> = {
  title: 'Launcher/ModManagerPage',
  component: ModManagerPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModManagerPage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <ModManagerPage />
    </div>
  )
};
