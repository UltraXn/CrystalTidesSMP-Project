import type { Meta, StoryObj } from '@storybook/react';
import StaffFormModal from '../../components/Admin/Staff/StaffFormModal';

const meta: Meta<typeof StaffFormModal> = {
  title: 'Admin/Staff/StaffFormModal',
  component: StaffFormModal,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffFormModal>;

const mockData = {
    id: 1,
    name: 'Neroferno',
    role: 'Neroferno',
    description: 'Founder',
    image: 'Neroferno',
    color: '#8b5cf6',
    socials: { discord: 'neroferno' }
};

export const EditExisting: Story = {
  args: {
    userData: mockData,
    isNew: false,
    onClose: () => {},
    onSave: (d) => console.log(d),
    saving: false
  },
};

export const CreateNew: Story = {
    args: {
      userData: null,
      isNew: true,
      onClose: () => {},
      onSave: (d) => console.log(d),
      saving: false
    },
};
