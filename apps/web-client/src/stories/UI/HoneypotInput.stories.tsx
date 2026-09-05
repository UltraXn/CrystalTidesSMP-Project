import type { Meta, StoryObj } from '@storybook/react';
import HoneypotInput from '../../components/UI/HoneypotInput';

const meta: Meta<typeof HoneypotInput> = {
  title: 'UI/HoneypotInput',
  component: HoneypotInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoneypotInput>;

export const WithinRegistrationForm: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px', background: '#12141c', padding: '1.5rem', borderRadius: '12px' }}>
      <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Correo Electrónico</label>
      <input type="email" placeholder="usuario@minecraft.net" style={{ background: '#222', border: '1px solid #333', padding: '0.6rem', color: '#fff', borderRadius: '6px' }} />
      {/* Invisible Honeypot field for bot trapping */}
      <HoneypotInput name="confirm_email" />
      <button type="submit" style={{ background: '#3b82f6', color: '#fff', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>
        Registrarse
      </button>
    </form>
  )
};
