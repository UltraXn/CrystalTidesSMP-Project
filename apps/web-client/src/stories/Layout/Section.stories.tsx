
import type { Meta, StoryObj } from '@storybook/react-vite';
import Section from '../../components/Layout/Section';

const meta = {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
      description: 'Direction of the entrance animation',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before animation starts',
    },
    title: {
      control: 'text',
      description: 'Optional title for the section',
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', color: 'white' }}>
        <h3>Content Content Content</h3>
        <p>This is a section content placeholder.</p>
      </div>
    ),
    direction: 'up',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Section Title',
    children: (
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', color: 'white' }}>
            <p>Section with a title prop provided.</p>
        </div>
    ),
  },
};

export const FromLeft: Story = {
  args: {
    direction: 'left',
    title: 'Entering from Left',
    children: (
        <div style={{ background: '#334155', padding: '2rem', borderRadius: '8px', color: 'white' }}>
            <p>Check the animation direction.</p>
        </div>
    ),
  },
};

export const WithDelay: Story = {
  args: {
    delay: 500,
    title: 'Delayed Appearance',
    children: (
        <div style={{ background: '#475569', padding: '2rem', borderRadius: '8px', color: 'white' }}>
            <p>This appears after 500ms.</p>
        </div>
    ),
  },
};
