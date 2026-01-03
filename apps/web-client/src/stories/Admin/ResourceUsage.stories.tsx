import type { Meta, StoryObj } from '@storybook/react';
import ResourceUsage from '../../components/Admin/Dashboard/ResourceUsage';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; 

const meta: Meta<typeof ResourceUsage> = {
  title: 'Admin/Dashboard/ResourceUsage',
  component: ResourceUsage,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0f', padding: '2rem', maxWidth: '600px' }}>
          <I18nextProvider i18n={i18n}>
             <Story />
          </I18nextProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ResourceUsage>;

export const Default: Story = {
  args: {
    cpu: 45,
    memory: { current: 8192, limit: 12144 }
  },
};

export const HighLoad: Story = {
    args: {
      cpu: 95,
      memory: { current: 11500, limit: 12000 }
    },
};
