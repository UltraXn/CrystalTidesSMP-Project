import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherNewsFeed } from '../LauncherNewsFeed';

describe('LauncherNewsFeed', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the header with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEWS FEED')).toBeInTheDocument();
  });

  it('renders the changelog card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText(/CHANGELOG/)).toBeInTheDocument();
    expect(screen.getByText(/> fetching build_0.9.2.../)).toBeInTheDocument();
    expect(screen.getByText(/- Performance optimizations/)).toBeInTheDocument();
    expect(screen.getByText(/- General bug fixes & stability/)).toBeInTheDocument();
  });

  it('renders the new version card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEW VERSION!')).toBeInTheDocument();
    expect(screen.getByText('New Minecraft version!')).toBeInTheDocument();
    expect(screen.getByText('26.1')).toBeInTheDocument();
    expect(screen.getByText(/Ready in.*Noctra/)).toBeInTheDocument();
  });

  it('renders the become a creator card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('PARTNER PROGRAM')).toBeInTheDocument();
    expect(screen.getByText(/BECOME A/)).toBeInTheDocument();
    expect(screen.getByText(/CREATOR/)).toBeInTheDocument();
    expect(
      screen.getByText('Get your custom code, earn revenue, and unlock creator cosmetics'),
    ).toBeInTheDocument();
  });

  it('renders the new mods card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEW MODS!')).toBeInTheDocument();
    expect(screen.getByText(/ADVANCED/)).toBeInTheDocument();
    expect(screen.getByText(/KEYSTROKES/)).toBeInTheDocument();
    expect(screen.getByText(/COMBAT/)).toBeInTheDocument();
    expect(screen.getByText(/HUD/)).toBeInTheDocument();
    expect(screen.getByText(/WEATHER/)).toBeInTheDocument();
    expect(screen.getByText(/CHANGER/)).toBeInTheDocument();
    expect(screen.getByText('NEW MODULES')).toBeInTheDocument();
  });

  it('opens the changelog link in a new tab when clicked', () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText(/CHANGELOG/).closest('button')!;
    fireEvent.click(card);
    expect(window.open).toHaveBeenCalledWith(
      'https://crystaltidessmp.net/news',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('opens the new version link in a new tab when clicked', () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText('NEW VERSION!').closest('button')!;
    fireEvent.click(card);
    expect(window.open).toHaveBeenCalledWith(
      'https://crystaltidessmp.net/download',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('opens the become a creator link in a new tab when clicked', () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText('PARTNER PROGRAM').closest('button')!;
    fireEvent.click(card);
    expect(window.open).toHaveBeenCalledWith(
      'https://crystaltidessmp.net',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('applies hover effects to changelog card', async () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText(/CHANGELOG/).closest('button')!;
    fireEvent.mouseEnter(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #404D6B');
      expect(card).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #262E42');
      expect(card).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to new version card', async () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText('NEW VERSION!').closest('button')!;
    fireEvent.mouseEnter(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #61F27A');
      expect(card).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #38734D');
      expect(card).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to become a creator card', async () => {
    render(<LauncherNewsFeed />);
    const card = screen.getByText('PARTNER PROGRAM').closest('button')!;
    fireEvent.mouseEnter(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #FACC66');
      expect(card).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(card);
    await waitFor(() => {
      expect(card).toHaveStyle('border-color: #593826');
      expect(card).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to new mods mini cards', async () => {
    render(<LauncherNewsFeed />);
    const modCard = (screen.getByText(/ADVANCED/).closest('button') ||
      screen.getByText(/ADVANCED/).closest('div[style*="cursor: pointer"]'))!;
    fireEvent.mouseEnter(modCard);
    await waitFor(() => {
      expect(modCard).toHaveStyle('border-color: #FF7380');
      expect(modCard).toHaveStyle('transform: translateY(-1px)');
    });
    fireEvent.mouseLeave(modCard);
    await waitFor(() => {
      expect(modCard).toHaveStyle('border-color: rgba(64, 46, 56, 0.6)');
      expect(modCard).toHaveStyle('transform: translateY(0)');
    });
  });
});
