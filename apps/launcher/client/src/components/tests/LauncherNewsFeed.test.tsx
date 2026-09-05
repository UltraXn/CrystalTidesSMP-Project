import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherNewsFeed from '../LauncherNewsFeed';

describe('LauncherNewsFeed', () => {
  beforeEach(() => {
    vi.mock('framer-motion', () => ({
      motion: {
        div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
        button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
      },
      AnimatePresence: ({ children }: any) => <>{children}</>,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header correctly', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText(/NEWS FEED/i)).toBeInTheDocument();
  });

  it('renders the correct number of cards', () => {
    render(<LauncherNewsFeed />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(4);
  });

  it('renders the changelog card with correct content', () => {
    render(<LauncherNewsFeed />);
    const changelogCard = screen.getByRole('button', { name: /changelog/i });
    expect(changelogCard).toBeInTheDocument();
    expect(changelogCard).toHaveAttribute('href', 'https://crystaltidessmp.net/news');
    expect(screen.getByText(/performance optimizations/i)).toBeInTheDocument();
    expect(screen.getByText(/general bug fixes & stability/i)).toBeInTheDocument();
  });

  it('renders the new version card with correct content', () => {
    render(<LauncherNewsFeed />);
    const newVersionCard = screen.getByRole('button', { name: /new version/i });
    expect(newVersionCard).toBeInTheDocument();
    expect(newVersionCard).toHaveAttribute('href', 'https://crystaltidessmp.net/download');
    expect(screen.getByText(/new minecraft version!/i)).toBeInTheDocument();
    expect(screen.getByText(/26.1/i)).toBeInTheDocument();
  });

  it('renders the become a creator card with correct content', () => {
    render(<LauncherNewsFeed />);
    const creatorCard = screen.getByRole('button', { name: /become a creator/i });
    expect(creatorCard).toBeInTheDocument();
    expect(creatorCard).toHaveAttribute('href', 'https://crystaltidessmp.net');
    expect(screen.getByText(/become a creator/i)).toBeInTheDocument();
    expect(screen.getByText(/get your custom code, earn revenue, and unlock creator cosmetics/i)).toBeInTheDocument();
  });

  it('renders the new mods card with correct content', () => {
    render(<LauncherNewsFeed />);
    const newModsCard = screen.getByRole('button', { name: /new mods!/i });
    expect(newModsCard).toBeInTheDocument();
    expect(screen.getByText(/advanced keystrokes/i)).toBeInTheDocument();
    expect(screen.getByText(/combat hud/i)).toBeInTheDocument();
    expect(screen.getByText(/weather changer/i)).toBeInTheDocument();
  });

  it('handles card clicks correctly', async () => {
    const user = userEvent.setup();
    render(<LauncherNewsFeed />);
    const changelogCard = screen.getByRole('button', { name: /changelog/i });
    await user.click(changelogCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net/news', '_blank');

    const newVersionCard = screen.getByRole('button', { name: /new version/i });
    await user.click(newVersionCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net/download', '_blank');

    const creatorCard = screen.getByRole('button', { name: /become a creator/i });
    await user.click(creatorCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net', '_blank');
  });

  it('renders the bottom gradient fade overlay correctly', () => {
    render(<LauncherNewsFeed />);
    const overlay = screen.getByRole('presentation');
    expect(overlay).toHaveStyle('position: absolute; bottom: 0; left: 0; right: 0; height: 60px;');
  });
});
