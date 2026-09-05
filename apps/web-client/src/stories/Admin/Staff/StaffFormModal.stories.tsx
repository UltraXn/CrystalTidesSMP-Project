import type { Meta, StoryObj } from '@storybook/react';
import StaffFormModal, { StaffCardData } from '../../../components/Admin/Staff/StaffFormModal';

const mockStaffData: StaffCardData = {
  id: 1,
  name: 'NeroFerno',
  mc_nickname: 'NeroFerno',
  role: 'Neroferno',
  role_en: 'Owner & Lead Dev',
  image: 'https://mc-heads.net/avatar/NeroFerno/100',
  color: '#db7700',
  description: 'Fundador y desarrollador principal de la infraestructura y sistemas RPG de CrystalTides SMP.',
  socials: {
    discord: 'neroferno',
    twitter: '@NeroFerno'
  }
};

const meta: Meta<typeof StaffFormModal> = {
  title: 'Admin/Staff/StaffFormModal',
  component: StaffFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffFormModal>;

export const EditExistingStaff: Story = {
  args: {
    userData: mockStaffData,
    isNew: false,
    onClose: () => console.log('Close staff form modal'),
    onSave: (data) => console.log('Save staff data:', data),
    saving: false
  }
};

export const CreateNewStaff: Story = {
  args: {
    userData: null,
    isNew: true,
    onClose: () => console.log('Close staff form modal'),
    onSave: (data) => console.log('Create new staff:', data),
    saving: false
  }
};
