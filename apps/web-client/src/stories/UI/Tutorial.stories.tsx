import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Tutorial from '../../components/UI/Tutorial';

const meta: Meta<typeof Tutorial> = {
  title: 'UI/TutorialModal',
  component: Tutorial,
  decorators: [
    (StoryComponent) => (
      <MemoryRouter>
        <AuthProvider>
          <div style={{ minHeight: '100vh', background: '#0b0c10', padding: '2rem' }}>
            <StoryComponent />
          </div>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Tutorial>;

export const Step1Welcome: Story = {
  args: {
    forceOpen: true,
  },
};
