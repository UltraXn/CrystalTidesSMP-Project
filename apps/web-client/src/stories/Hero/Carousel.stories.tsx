import type { Meta, StoryObj } from '@storybook/react';
import HeroBackgroundCarousel from '../../components/Hero/Carousel';

const meta: Meta<typeof HeroBackgroundCarousel> = {
  title: 'Hero/Carousel',
  component: HeroBackgroundCarousel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeroBackgroundCarousel>;

export const AutoplayFadeCarousel: Story = {
  args: {
    slides: [
      { image: '/images/backgrounds/hero-bg-1.webp', title: 'Temporada de Reinos', text: 'Explora y conquista', buttonText: 'Jugar', link: '/play' },
      { image: '/images/backgrounds/hero-bg-2.webp', title: 'Nuevos Biomas Abisales', text: 'Descubre criaturas únicas' },
      { image: '/images/backgrounds/hero-bg-3.webp' },
    ],
  },
};
