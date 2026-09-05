import type { Meta, StoryObj } from '@storybook/react';
import LocationsManager from '../../../components/Admin/Config/LocationsManager';

const meta: Meta<typeof LocationsManager> = {
  title: 'Admin/Config/LocationsManager',
  component: LocationsManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LocationsManager>;

export const DefaultLocationsManagerView: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '12px' }}>
      <LocationsManager />
    </div>
  )
};
