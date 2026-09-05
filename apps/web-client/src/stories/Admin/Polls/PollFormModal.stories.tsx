import type { Meta, StoryObj } from '@storybook/react';
import PollFormModal from '../../../components/Admin/Polls/PollFormModal';

const meta: Meta<typeof PollFormModal> = {
  title: 'Admin/Polls/PollFormModal',
  component: PollFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PollFormModal>;

export const CreateNewBossPoll: Story = {
  args: {
    onClose: () => console.log('Close poll modal'),
    onSubmit: async (_e, data) => { console.log('Submit poll:', data); },
    poll: null,
    creating: false,
    buttonSuccess: false,
    hasActivePoll: false,
    onTranslate: (text, field, idx) => console.log('Translate:', text, field, idx),
    translatingField: null,
    translatedValues: {}
  }
};

export const EditExistingPoll: Story = {
  args: {
    onClose: () => console.log('Close poll modal'),
    onSubmit: async (_e, data) => { console.log('Submit poll:', data); },
    poll: {
      id: 5,
      title: '¿Cuál debería ser el siguiente Jefe de Mazmorra?',
      title_en: 'Which should be the next Dungeon Boss?',
      question: 'Vota por la amenaza dimensional que quieres enfrentar en el siguiente parche.',
      question_en: 'Vote for the dimensional threat you want to face next patch.',
      options: [
        { id: 1, label: 'Ignis (Señor del Fuego)', label_en: 'Ignis (Lord of Fire)', votes: 42 },
        { id: 2, label: 'Netherite Monstrosity', label_en: 'Netherite Monstrosity', votes: 88 },
        { id: 3, label: 'The Harbinger', label_en: 'The Harbinger', votes: 65 }
      ],
      created_at: new Date().toISOString()
    },
    creating: false,
    buttonSuccess: false,
    hasActivePoll: true,
    onTranslate: () => {},
    translatingField: null,
    translatedValues: {}
  }
};
