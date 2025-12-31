import type { Meta, StoryObj } from '@storybook/react-vite';
import MarkdownRenderer from '../../components/UI/MarkdownRenderer';

const meta = {
  title: 'Widgets/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark'
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    content: 'This is a **bold** text and this is *italic*.',
  },
};

export const LinksAndImages: Story = {
  args: {
    content: 'Check out [CrystalTides](https://crystaltidessmp.net).\n\n![Logo](/images/ui/logo.webp)',
  },
};

export const Complex: Story = {
    args: {
        content: `
**Welcome to the Server!**

We have many features:
* Custom Enchants
* Dungeons
* And more!

[Join our Discord](https://discord.gg/crystaltides) for updates.
        `
    }
}
