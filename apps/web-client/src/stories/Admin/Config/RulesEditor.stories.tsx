import type { Meta, StoryObj } from '@storybook/react';
import RulesEditor from '../../../components/Admin/Config/RulesEditor';

const meta: Meta<typeof RulesEditor> = {
  title: 'Admin/Config/RulesEditor',
  component: RulesEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RulesEditor>;

export const DefaultRulesEditorView: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#0d0f17', padding: '1.5rem', borderRadius: '12px' }}>
      <RulesEditor />
    </div>
  )
};
