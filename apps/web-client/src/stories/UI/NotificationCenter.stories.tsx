import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationCenter from '../../components/UI/NotificationCenter';

const meta = {
  title: 'UI/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark'
    },
    docs: {
        description: {
            component: 'Panel notification bell with a dropdown menu. Currently manages its own internal state.'
        }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
