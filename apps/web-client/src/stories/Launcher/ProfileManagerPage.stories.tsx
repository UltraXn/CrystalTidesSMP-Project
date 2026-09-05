import type { Meta, StoryObj } from '@storybook/react';
import { ProfileManagerPage } from '../../components/Launcher/ProfileManagerPage';

const meta: Meta<typeof ProfileManagerPage> = {
  title: 'Launcher/ProfileManagerPage',
  component: ProfileManagerPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileManagerPage>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', background: '#0b0c10' }}>
      <ProfileManagerPage />
    </div>
  )
};
