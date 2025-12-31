import type { Meta, StoryObj } from '@storybook/react-vite';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import { useState, ComponentProps } from 'react';

// Wrapper to handle state
const ModalWrapper = (args: Omit<ComponentProps<typeof ConfirmationModal>, 'onClose' | 'onConfirm'> & { onClose?: () => void; onConfirm?: () => void }) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    const handleClose = () => {
        setIsOpen(false);
        args.onClose?.();
    };

    const handleConfirm = () => {
        setIsOpen(false);
        args.onConfirm?.();
    };

    return (
        <div>
            <button onClick={() => setIsOpen(true)} style={{ color: 'white', padding: '10px 20px', border: '1px solid white', background: 'transparent', borderRadius: '8px' }}>
                Open Modal
            </button>
            <ConfirmationModal
                {...args}
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

const meta = {
  title: 'UI/ConfirmationModal',
  component: ModalWrapper,
  parameters: {
    layout: 'centered',
    docs: {
        description: {
            component: 'Modal for confirming dangerous or important actions.'
        }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    confirmText: { control: 'text' },
    cancelText: { control: 'text' },
    isDanger: { control: 'boolean' },
  },
} satisfies Meta<typeof ConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
  },
};

export const Danger: Story = {
  args: {
    isOpen: true,
    title: 'Delete Character',
    message: 'This action cannot be undone. Are you sure you want to delete this character permanently?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDanger: true, 
  },
};
