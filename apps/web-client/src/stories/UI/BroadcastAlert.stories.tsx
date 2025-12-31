import type { Meta, StoryObj } from '@storybook/react-vite';
import BroadcastAlert from '../../components/UI/BroadcastAlert';
import { useEffect } from 'react';

interface BroadcastStoryArgs {
    active: boolean;
    type: 'alert' | 'error' | 'info';
    message: string;
}

// Wrapper to bridge Storybook args to the window event
const BroadcastWrapper = (args: BroadcastStoryArgs) => {
    useEffect(() => {
        // Delay slightly to ensure component is mounted and listening
        const timer = setTimeout(() => {
            const event = new CustomEvent('broadcastChanged', {
                detail: JSON.stringify(args)
            });
            window.dispatchEvent(event);
        }, 100);
        return () => clearTimeout(timer);
    }, [args]);

    return (
        <div>
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                (Alert will appear at the top of this frame)
            </div>
            <BroadcastAlert />
        </div>
    );
};

const meta = {
  title: 'UI/BroadcastAlert',
  component: BroadcastWrapper, // Use wrapper as the main component for controls
  parameters: {
    layout: 'padded', // Let it sit at the top relative to padding
    docs: {
        description: {
            component: 'Listens to "broadcastChanged" window event to display global alerts. Controlled here via Storybook args acting as event dispatchers.'
        }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    type: { control: 'select', options: ['info', 'alert', 'error'] },
    message: { control: 'text' },
  },
} satisfies Meta<typeof BroadcastAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    active: true,
    type: 'info',
    message: 'Welcome to the CrystalTides Storybook!',
  },
};

export const Warning: Story = {
  args: {
    active: true,
    type: 'alert',
    message: 'Maintenance is scheduled for tonight at 20:00 UTC.',
  },
};

export const Error: Story = {
  args: {
    active: true,
    type: 'error',
    message: 'Failed to connect to the server. Please check your internet connection.',
  },
};
