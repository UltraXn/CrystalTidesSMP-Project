import type { Meta, StoryObj } from '@storybook/react';
import HeroBannerManager, { HeroSlide } from '../../../components/Admin/Config/HeroBannerManager';

const mockSlides: HeroSlide[] = [
  {
    id: 1,
    image: '/images/backgrounds/hero-bg-1.webp',
    title: '¡Bienvenido a CrystalTides SMP!',
    text: 'La experiencia survival definitiva en la versión 1.21.1',
    buttonText: 'Jugar Ahora',
    link: '/play'
  },
  {
    id: 2,
    image: '/images/backgrounds/hero-bg-2.webp',
    title: 'Nuevo Jefe Imperial: Ignis',
    text: 'Derrota al señor del fuego en el altar de llamas eternas.',
    buttonText: 'Ver Guía',
    link: '/wiki/ignis'
  }
];

const meta: Meta<typeof HeroBannerManager> = {
  title: 'Admin/Config/HeroBannerManager',
  component: HeroBannerManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeroBannerManager>;

export const DefaultHeroSlidesManager: Story = {
  args: {
    settings: {
      hero_slides: JSON.stringify(mockSlides)
    },
    onUpdate: (key, val) => console.log('Update banner slide:', key, val),
    saving: null
  }
};
