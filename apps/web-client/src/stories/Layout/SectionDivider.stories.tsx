
import type { Meta, StoryObj } from '@storybook/react-vite';
import SectionDivider from '../../components/Layout/SectionDivider';

const meta = {
  title: 'Layout/SectionDivider',
  component: SectionDivider,
  parameters: {
    layout: 'padded',
    backgrounds: {
        default: 'dark',
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
