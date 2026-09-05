import type { Meta, StoryObj } from '@storybook/react';
import AdminDocs from '../../components/Admin/AdminDocs';

const meta: Meta<typeof AdminDocs> = {
  title: 'Admin/Docs/AdminDocs',
  component: AdminDocs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminDocs>;

export const DefaultDocumentationView: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '14px' }}>
      <AdminDocs />
    </div>
  )
};
