import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import EventFormModal from '../../../components/Admin/Events/EventFormModal';
import { Event } from '../../../components/Admin/Events/types';

const mockEvent: Event = {
  id: 1,
  title: 'Torneo de Maestros del Abismo',
  title_en: 'Masters of the Abyss Tournament',
  description: 'Compite por el trono del PvP en la arena celestial y gana 50,000 Killucoins.',
  description_en: 'Compete for the PvP throne in the celestial arena and win 50,000 Killucoins.',
  type: 'dice',
  status: 'active',
  image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e'
};

const meta: Meta<typeof EventFormModal> = {
  title: 'Admin/Events/EventFormModal',
  component: EventFormModal,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventFormModal>;

function EventFormModalStoryComponent({ initialEvent }: { initialEvent: Event }) {
  const [event, setEvent] = useState<Event | null>(initialEvent);

  if (!event) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '12px' }}>
      <EventFormModal
        currentEvent={event}
        setCurrentEvent={setEvent}
        onClose={() => console.log('Close event modal')}
        onSave={async (e) => { e.preventDefault(); console.log('Save event:', event); }}
        API_URL="/api"
        saving={false}
      />
    </div>
  );
}

export const EditExistingEvent: Story = {
  render: () => <EventFormModalStoryComponent initialEvent={mockEvent} />
};

export const CreateNewEvent: Story = {
  render: () => (
    <EventFormModalStoryComponent
      initialEvent={{
        id: 0,
        title: '',
        title_en: '',
        description: '',
        description_en: '',
        type: 'dice',
        status: 'active',
        image_url: ''
      }}
    />
  )
};
