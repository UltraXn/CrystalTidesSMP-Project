import type { Meta, StoryObj } from '@storybook/react';
import ResourceUsage from '../../../components/Admin/Dashboard/ResourceUsage';

const meta: Meta<typeof ResourceUsage> = {
  title: 'AdminDashboard/ResourceUsage',
  component: ResourceUsage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    cpu: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceUsage>;

export const HealthyServerResources: Story = {
  args: {
    cpu: 35,
    memory: { current: 12.4, limit: 32 },
  },
};

export const HighLoadServer: Story = {
  args: {
    cpu: 92,
    memory: { current: 28.8, limit: 32 },
  },
};
