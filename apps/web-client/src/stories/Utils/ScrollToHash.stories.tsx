import type { Meta, StoryObj } from '@storybook/react';
import ScrollToHash from '../../components/Utils/ScrollToHash';

const meta: Meta<typeof ScrollToHash> = {
  title: 'Utils/ScrollToHash',
  component: ScrollToHash,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollToHash>;

export const DefaultScrollListener: Story = {
  render: () => (
    <div style={{ background: '#12141c', padding: '2rem', borderRadius: '12px', color: '#ccc' }}>
      <ScrollToHash />
      <p style={{ margin: 0 }}>Componente utilitario sin interfaz gráfica. Gestiona el scroll suave hacia los anclas `#hash`.</p>
    </div>
  )
};
