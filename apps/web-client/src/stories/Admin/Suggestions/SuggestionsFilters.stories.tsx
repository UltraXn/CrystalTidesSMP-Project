import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SuggestionsFilters from '../../../components/Admin/Suggestions/SuggestionsFilters';

const meta: Meta<typeof SuggestionsFilters> = {
  title: 'Admin/Suggestions/SuggestionsFilters',
  component: SuggestionsFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuggestionsFilters>;

function SuggestionsFiltersInteractive() {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '12px' }}>
      <SuggestionsFilters
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
    </div>
  );
}

export const InteractiveFilters: Story = {
  render: () => <SuggestionsFiltersInteractive />
};
