import type { Meta, StoryObj } from '@storybook/react';
import AboutRoles from '../../components/Home/AboutRoles';

const meta: Meta<typeof AboutRoles> = {
  title: 'Home/AboutRoles',
  component: AboutRoles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AboutRoles>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#0b0c10', minHeight: '100vh', padding: '2rem 0' }}>
      <AboutRoles />
    </div>
  )
};
