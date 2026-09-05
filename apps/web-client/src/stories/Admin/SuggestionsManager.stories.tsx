import type { Meta, StoryObj } from '@storybook/react';
import SuggestionsManager from '../../components/Admin/SuggestionsManager';

const meta: Meta<typeof SuggestionsManager> = {
  title: 'Admin/SuggestionsManager',
  component: SuggestionsManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionsManager>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <SuggestionsManager />
    </div>
  )
};
