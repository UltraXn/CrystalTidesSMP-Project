import type { Meta, StoryObj } from '@storybook/react-vite';
import SuccessModal from '../../components/UI/SuccessModal';
import { useState, ComponentProps } from 'react';

// Wrapper to handle state
const ModalWrapper = (args: Omit<ComponentProps<typeof SuccessModal>, 'onClose' | 'onAction'> & { onClose?: () => void; onAction?: () => void }) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    const handleClose = () => {
        setIsOpen(false);
        args.onClose?.();
    };

    return (
        <div>
            <button onClick={() => setIsOpen(true)} style={{ color: 'white', padding: '10px 20px', border: '1px solid white', background: 'transparent', borderRadius: '8px' }}>
                Open Success Modal
            </button>
            <SuccessModal
                {...args}
                isOpen={isOpen}
                onClose={handleClose}
                onAction={handleClose}
            />
        </div>
    );
};

const meta = {
  title: 'UI/SuccessModal',
  component: ModalWrapper,
  parameters: {
    layout: 'centered',
    docs: {
        description: {
            component: 'Modal for displaying success messages.'
        }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    buttonText: { control: 'text' },
  },
} satisfies Meta<typeof SuccessModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Operation Successful',
    message: 'Your changes have been saved successfully.',
    buttonText: 'OK',
  },
};

export const PurchaseSuccess: Story = {
    args: {
        isOpen: true,
        title: 'Purchase Complete!',
        message: 'Thank you for your purchase. Your items will be delivered shortly.',
        buttonText: 'Return to Shop',
    }
}
