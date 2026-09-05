import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import FlashBountyBanner from '@/components/UI/FlashBountyBanner';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: ComponentPropsWithoutRef<'div'>) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: ComponentPropsWithoutRef<'button'>) => <button {...p}>{children}</button>,
  },
  m: {
    div: ({ children, ...p }: ComponentPropsWithoutRef<'div'>) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: ComponentPropsWithoutRef<'button'>) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

describe('FlashBountyBanner', () => {
  const mockBounty = {
    id: 'bounty-ignis-001',
    bossId: 'ignis',
    bossName: 'Ignis (Jefe Imperial del Fuego)',
    location: 'Altar Imperial del Nether',
    multiplier: '2.5x KC',
    rewardKc: 5000,
    remainingSeconds: 2700,
    isExpired: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the banner with active bounty data from fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, bounty: mockBounty }),
    } as unknown as Response);

    render(<FlashBountyBanner />);

    await waitFor(() => {
      expect(screen.getByText('Ignis (Jefe Imperial del Fuego)')).toBeInTheDocument();
      expect(screen.getByText(/Flash Bounty Activa/i)).toBeInTheDocument();
      expect(screen.getByText(/Altar Imperial del Nether/i)).toBeInTheDocument();
      expect(screen.getByText('2.5x KC')).toBeInTheDocument();
      expect(screen.getByText('+5000 KC')).toBeInTheDocument();
      expect(screen.getByText('45:00')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ir a cazar/i })).toHaveAttribute('href', '/wiki/ignis');
    });
  });

  it('should render nothing when bounty is expired', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, bounty: { ...mockBounty, isExpired: true } }),
    } as unknown as Response);

    const { container } = render(<FlashBountyBanner />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render fallback bounty when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<FlashBountyBanner />);

    await waitFor(() => {
      expect(screen.getByText('Ignis (Jefe Imperial del Fuego)')).toBeInTheDocument();
    });
  });
});
