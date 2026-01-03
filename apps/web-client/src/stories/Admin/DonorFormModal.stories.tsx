import type { Meta, StoryObj } from '@storybook/react';
import DonorFormModal, { Donor } from '../../components/Admin/Donors/DonorFormModal';

const meta: Meta<typeof DonorFormModal> = {
  title: 'Admin/Donors/DonorFormModal',
  component: DonorFormModal,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorFormModal>;

const mockDonor: Donor = {
    id: '1',
    name: 'Killu Bysmali',
    skinUrl: 'https://mc-heads.net/avatar/Killu/64',
    description: 'Founder and main developer',
    ranks: ['killu', 'developer'],
    isPremium: true
};

export const CreateNew: Story = {
  args: {
    donor: {
        id: '',
        name: '',
        skinUrl: '',
        description: '',
        description_en: '',
        ranks: ['donador'],
        isPremium: false
    },
    isNew: true,
    onClose: () => console.log('Close'),
    onSave: (d) => console.log('Save', d),
    saving: false
  },
};

export const EditExisting: Story = {
    args: {
      donor: mockDonor,
      isNew: false,
      onClose: () => console.log('Close'),
      onSave: (d) => console.log('Save', d),
      saving: false
    },
};

export const SavingState: Story = {
    args: {
      donor: mockDonor,
      isNew: false,
      onClose: () => {},
      onSave: () => {},
      saving: true
    },
};
