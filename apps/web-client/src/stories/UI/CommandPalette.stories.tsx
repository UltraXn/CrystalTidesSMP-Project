import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import CommandPalette from '../../components/UI/CommandPalette';

const meta: Meta<typeof CommandPalette> = {
  title: 'UI/CommandPalette',
  component: CommandPalette,
  decorators: [
    (StoryComponent) => (
      <MemoryRouter>
        <AuthProvider>
          <div style={{ minHeight: '500px', background: '#0b0c10', padding: '2rem' }}>
            <StoryComponent />
          </div>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const OpenPaletteModal: Story = {
  args: {
    forceOpen: true,
  },
};
