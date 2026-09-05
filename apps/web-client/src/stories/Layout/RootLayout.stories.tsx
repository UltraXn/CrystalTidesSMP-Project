import type { Meta, StoryObj } from '@storybook/react';
import RootLayout from '../../components/Layout/RootLayout';

const meta: Meta<typeof RootLayout> = {
  title: 'Layout/RootLayout',
  component: RootLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RootLayout>;

export const DefaultRootLayoutView: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', background: '#090a10' }}>
      <RootLayout />
    </div>
  )
};
