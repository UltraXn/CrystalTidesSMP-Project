// eslint-disable-next-line
import type { Meta, StoryObj } from '@storybook/react';
import EmblaCarousel from '../../components/UI/EmblaCarousel';

const meta = {
  title: 'Widgets/EmblaCarousel',
  component: EmblaCarousel,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
        default: 'dark'
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmblaCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const slides = [
    {
        image: 'Neroferno',
        name: 'Neroferno',
        rank: <span style={{ color: '#FF5555', fontWeight: 'bold' }}>OWNER</span>,
        description: 'Server Owner & Developer',
    },
    {
        image: 'Killuwu',
        name: 'Killuwu',
        rank: <span style={{ color: '#55FFFF', fontWeight: 'bold' }}>ADMIN</span>,
        description: 'Community Manager',
    },
    {
        image: 'Steve',
        name: 'Steve',
        rank: <span style={{ color: '#AAAAAA', fontWeight: 'bold' }}>DEFAULT</span>,
        description: 'A regular player',
    },
];

export const Default: Story = {
  args: {
    slides: slides,
    options: { loop: true },
  },
};

export const SingleSlide: Story = {
    args: {
        slides: [slides[0]],
        options: { loop: false },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: '2rem', '--slide-size': '100%' } as React.CSSProperties}>
                <Story />
            </div>
        )
    ]
}
