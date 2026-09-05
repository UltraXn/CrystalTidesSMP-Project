import type { Meta, StoryObj } from '@storybook/react';
import { ProfileSelector } from '../../components/Launcher/ProfileSelector';

const meta: Meta<typeof ProfileSelector> = {
  title: 'Launcher/ProfileSelector',
  component: ProfileSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileSelector>;

export const Default: Story = {
  args: {
    onEditProfile: () => console.log('Edit profile clicked'),
    onCreateProfile: () => console.log('Create new profile clicked'),
    onProfileChanged: () => console.log('Active profile changed')
  },
  render: (args) => (
    <div style={{ padding: '2rem', background: '#0e1017', borderRadius: '16px', border: '1px solid #1f2430' }}>
      <ProfileSelector {...args} />
    </div>
  )
};
