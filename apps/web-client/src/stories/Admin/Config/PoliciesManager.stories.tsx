import type { Meta, StoryObj } from '@storybook/react';
import PoliciesManager from '../../../components/Admin/Config/PoliciesManager';

const meta: Meta<typeof PoliciesManager> = {
  title: 'Admin/Config/PoliciesManager',
  component: PoliciesManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PoliciesManager>;

export const DefaultPolicyEditor: Story = {
  render: () => (
    <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '12px' }}>
      <PoliciesManager />
    </div>
  )
};
