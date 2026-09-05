import type { Meta, StoryObj } from '@storybook/react';
import { HomePage } from '../../components/Launcher/HomePage';

const meta: Meta<typeof HomePage> = {
  title: 'Launcher/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <HomePage />
    </div>
  )
};
