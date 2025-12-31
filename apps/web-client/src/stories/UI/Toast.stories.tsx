import type { Meta, StoryObj } from '@storybook/react-vite';
import Toast from '../../components/UI/Toast';
import { useState, ComponentProps } from 'react';

const ToastWrapper = (args: Omit<ComponentProps<typeof Toast>, 'isVisible' | 'onClose'> & { isVisible?: boolean, onClose?: () => void }) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleClose = () => {
        setIsVisible(false);
        args.onClose?.();
    };

    return (
        <div>
            <button 
                onClick={() => setIsVisible(true)} 
                style={{ 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: '1px solid white', 
                    background: 'transparent', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                Trigger Toast
            </button>
            <Toast
                {...args}
                isVisible={isVisible}
                onClose={handleClose}
            />
        </div>
    );
};

const meta = {
  title: 'UI/Toast',
  component: ToastWrapper,
  parameters: {
    layout: 'centered',
    docs: {
        description: {
            component: 'Transient notification toast that appears at the top center of the screen.'
        }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    type: { control: 'select', options: ['info', 'success', 'error'] },
    duration: { control: 'number' },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    message: 'This is an information message.',
    type: 'info',
    duration: 3000,
  },
};

export const Success: Story = {
    args: {
        message: 'Saved successfully!',
        type: 'success',
        duration: 3000,
    }
}

export const Error: Story = {
    args: {
        message: 'Something went wrong.',
        type: 'error',
        duration: 5000,
    }
}
