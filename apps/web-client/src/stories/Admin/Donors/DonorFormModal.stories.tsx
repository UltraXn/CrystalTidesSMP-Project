import type { Meta, StoryObj } from '@storybook/react';
import DonorFormModal, { Donor } from '../../../components/Admin/Donors/DonorFormModal';

const mockDonor: Donor = {
  id: 'donor-1',
  name: 'KilluMaster',
  skinUrl: 'https://mc-heads.net/skin/Steve',
  description: 'Donador fundador de la primera temporada de CrystalTides.',
  description_en: 'Founding donor from season one of CrystalTides.',
  ranks: ['donador', 'fundador'],
  isPremium: true
};

const meta: Meta<typeof DonorFormModal> = {
  title: 'Admin/Donors/DonorFormModal',
  component: DonorFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonorFormModal>;

export const EditDonor: Story = {
  args: {
    donor: mockDonor,
    isNew: false,
    onClose: () => console.log('Close modal'),
    onSave: (d) => console.log('Save donor:', d),
    saving: false
  }
};

export const CreateNewDonor: Story = {
  args: {
    donor: null,
    isNew: true,
    onClose: () => console.log('Close modal'),
    onSave: (d) => console.log('Save new donor:', d),
    saving: false
  }
};
