import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useEmblaCarousel from 'embla-carousel-react';
import EmblaCarousel from '@/components/UI/EmblaCarousel';

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(),
}));

vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/Widgets/SkinViewer', () => ({
  default: () => <div data-testid="skin-viewer">SkinViewer</div>,
}));

interface Slide {
  image: string;
  name: string;
  rank: React.ReactNode;
  description: string;
}

const mockSlides: Slide[] = [
  {
    image: 'https://example.com/steve.png',
    name: 'Player One',
    rank: 'VIP+',
    description: 'First test donor',
  },
  {
    image: 'https://example.com/alex.png',
    name: 'Player Two',
    rank: 'MVP',
    description: 'Second test donor',
  },
];

describe('EmblaCarousel', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockScrollPrev: ReturnType<typeof vi.fn>;
  let mockScrollNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    user = userEvent.setup();
    mockScrollPrev = vi.fn();
    mockScrollNext = vi.fn();

    vi.mocked(useEmblaCarousel).mockReturnValue([
      vi.fn() as unknown as ReturnType<typeof useEmblaCarousel>[0],
      {
        scrollPrev: mockScrollPrev,
        scrollNext: mockScrollNext,
      } as unknown as ReturnType<typeof useEmblaCarousel>[1],
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders slides and donor info correctly', () => {
    render(<EmblaCarousel slides={mockSlides} />);
    
    mockSlides.forEach(slide => {
      expect(screen.getByText(slide.name)).toBeInTheDocument();
      expect(screen.getByText(slide.rank as string)).toBeInTheDocument();
      expect(screen.getByText(`"${slide.description}"`)).toBeInTheDocument();
    });
  });

  it('calls scrollPrev when previous slide button is clicked', async () => {
    render(<EmblaCarousel slides={mockSlides} />);
    const prevBtn = screen.getByRole('button', { name: /diapositiva anterior/i });
    await user.click(prevBtn);
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);
  });

  it('calls scrollNext when next slide button is clicked', async () => {
    render(<EmblaCarousel slides={mockSlides} />);
    const nextBtn = screen.getByRole('button', { name: /diapositiva siguiente/i });
    await user.click(nextBtn);
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });
});
