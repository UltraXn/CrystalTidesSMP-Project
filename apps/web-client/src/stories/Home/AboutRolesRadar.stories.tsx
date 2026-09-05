import type { Meta, StoryObj } from '@storybook/react';
import AboutRolesRadar from '../../components/Home/AboutRolesRadar';

const mockCombatData = [
  { subject: 'DPS', A: 95, fullMark: 100 },
  { subject: 'Defensa', A: 70, fullMark: 100 },
  { subject: 'Agilidad', A: 85, fullMark: 100 },
  { subject: 'Magia', A: 40, fullMark: 100 },
  { subject: 'Soporte', A: 60, fullMark: 100 },
];

const mockBuilderData = [
  { subject: 'Bloques', A: 98, fullMark: 100 },
  { subject: 'Diseño', A: 90, fullMark: 100 },
  { subject: 'Redstone', A: 85, fullMark: 100 },
  { subject: 'Eficiencia', A: 75, fullMark: 100 },
  { subject: 'Comercio', A: 80, fullMark: 100 },
];

const meta: Meta<typeof AboutRolesRadar> = {
  title: 'Home/AboutRolesRadar',
  component: AboutRolesRadar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AboutRolesRadar>;

export const CombatPlaystyle: Story = {
  args: {
    data: mockCombatData,
    colorHex: '#ef4444'
  },
  render: (args) => (
    <div style={{ width: '320px', height: '240px', background: '#12141c', padding: '1rem', borderRadius: '16px' }}>
      <AboutRolesRadar {...args} />
    </div>
  )
};

export const BuilderPlaystyle: Story = {
  args: {
    data: mockBuilderData,
    colorHex: '#10b981'
  },
  render: (args) => (
    <div style={{ width: '320px', height: '240px', background: '#12141c', padding: '1rem', borderRadius: '16px' }}>
      <AboutRolesRadar {...args} />
    </div>
  )
};
