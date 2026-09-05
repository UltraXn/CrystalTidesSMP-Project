import type { Meta, StoryObj } from '@storybook/react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { within, expect } from '@storybook/test';
import NotificationCenter from '../../components/UI/NotificationCenter';

const meta: Meta<typeof NotificationCenter> = {
  title: 'UI/NotificationCenter',
  component: NotificationCenter,
  decorators: [
    (StoryComponent) => (
      <LazyMotion features={domAnimation}>
        <div style={{ height: '350px', display: 'flex', justifyContent: 'flex-end', background: '#0b0c10', padding: '2rem' }}>
          <StoryComponent />
        </div>
      </LazyMotion>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const OpenNotificationPanel: Story = {
  args: {
    initialOpen: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const notification = await canvas.findByText('Rango Activado');
    await expect(notification).toBeInTheDocument();
  },
};
