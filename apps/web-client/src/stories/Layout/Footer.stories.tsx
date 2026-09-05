import type { Meta, StoryObj } from '@storybook/react';
import Footer from '../../components/Layout/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const DefaultFooter: Story = {
  render: () => (
    <div style={{ background: '#050505' }}>
      <Footer />
    </div>
  )
};
