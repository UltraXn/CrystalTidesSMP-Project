import type { Meta, StoryObj } from '@storybook/react';
import StaffCardsManager from '../../components/Admin/StaffCardsManager';

const meta: Meta<any> = {
  title: 'Admin/StaffCardsManager',
  component: StaffCardsManager,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const AbyssalVariant: Story = {
  args: {
    
    "description": "Objeto místico de CrystalTides SMP",
    "color": "#38BDF8"
},
};

export const LegendaryVariant: Story = {
  args: {
    
    "description": "Rareza suprema",
    "color": "#F59E0B"
},
};
