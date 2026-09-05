import type { Meta, StoryObj } from '@storybook/react';
import SectionDivider from '../../components/Layout/SectionDivider';

const meta: Meta<typeof SectionDivider> = {
  title: 'Layout/SectionDivider',
  component: SectionDivider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SectionDivider>;

export const GlowingCrystalDivider: Story = {
  render: () => (
    <div style={{ background: '#090a10', padding: '3rem 1rem' }}>
      <SectionDivider />
    </div>
  )
};
