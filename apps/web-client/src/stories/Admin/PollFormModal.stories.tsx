import type { Meta, StoryObj } from '@storybook/react';
import PollFormModal from '../../components/Admin/Polls/PollFormModal';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof PollFormModal> = {
  title: 'Admin/Polls/PollFormModal',
  component: PollFormModal,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', padding: '2rem', height: '100vh' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PollFormModal>;

export const Create: Story = {
  args: {
    onClose: () => console.log('Close'),
    onSubmit: async () => {},
    poll: null,
    creating: false,
    buttonSuccess: false,
    hasActivePoll: false,
    onTranslate: () => console.log('Translate'),
    translatingField: null,
    translatedValues: {}
  },
};

export const Edit: Story = {
    args: {
      onClose: () => console.log('Close'),
      onSubmit: async () => {},
      poll: {
          id: 1,
          title: 'Encuesta Existente',
          question: 'Pregunta de prueba',
          options: [{label: 'Opción A'}, {label: 'Opción B'}],
          totalVotes: 0,
          is_active: true
      } as any,
      creating: false,
      buttonSuccess: false,
      hasActivePoll: true,
      onTranslate: () => console.log('Translate'),
      translatingField: null,
      translatedValues: {}
    },
  };
