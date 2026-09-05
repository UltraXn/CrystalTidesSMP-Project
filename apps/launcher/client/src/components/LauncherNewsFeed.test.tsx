import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherNewsFeed } from './LauncherNewsFeed';

describe('LauncherNewsFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEWS FEED')).toBeInTheDocument();
  });

  it('renders the changelog card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('N CHANGELOG')).toBeInTheDocument();
    expect(screen.getByText('fetching build_0.9.2...')).toBeInTheDocument();
    expect(screen.getByText('Performance optimizations')).toBeInTheDocument();
    expect(screen.getByText('General bug fixes & stability')).toBeInTheDocument();
  });

  it('renders the new version card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEW VERSION!')).toBeInTheDocument();
    expect(screen.getByText('New Minecraft version!')).toBeInTheDocument();
    expect(screen.getByText('26.1')).toBeInTheDocument();
    expect(screen.getByText('Ready in ∿ Noctra')).toBeInTheDocument();
  });

  it('renders the become a creator card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('PARTNER PROGRAM')).toBeInTheDocument();
    expect(screen.getByText('BECOME A')).toBeInTheDocument();
    expect(screen.getByText('CREATOR')).toBeInTheDocument();
    expect(screen.getByText('Get your custom code, earn revenue, and unlock creator cosmetics')).toBeInTheDocument();
  });

  it('renders the new mods card with correct text', () => {
    render(<LauncherNewsFeed />);
    expect(screen.getByText('NEW MODS!')).toBeInTheDocument();
    expect(screen.getByText('ADVANCED')).toBeInTheDocument();
    expect(screen.getByText('KEYSTROKES')).toBeInTheDocument();
    expect(screen.getByText('COMBAT')).toBeInTheDocument();
    expect(screen.getByText('HUD')).toBeInTheDocument();
    expect(screen.getByText('WEATHER')).toBeInTheDocument();
    expect(screen.getByText('CHANGER')).toBeInTheDocument();
    expect(screen.getByText('NEW MODULES')).toBeInTheDocument();
  });

  it('opens the changelog link in a new tab', () => {
    render(<LauncherNewsFeed />);
    const changelogCard = screen.getByText('N CHANGELOG');
    fireEvent.click(changelogCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net/news', '_blank');
  });

  it('opens the new version link in a new tab', () => {
    render(<LauncherNewsFeed />);
    const newVersionCard = screen.getByText('NEW VERSION!');
    fireEvent.click(newVersionCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net/download', '_blank');
  });

  it('opens the become a creator link in a new tab', () => {
    render(<LauncherNewsFeed />);
    const becomeCreatorCard = screen.getByText('BECOME A');
    fireEvent.click(becomeCreatorCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net', '_blank');
  });

  it('opens the new mods link in a new tab', () => {
    render(<LauncherNewsFeed />);
    const newModsCard = screen.getByText('NEW MODS!');
    fireEvent.click(newModsCard);
    expect(window.open).toHaveBeenCalledWith('https://crystaltidessmp.net', '_blank');
  });

  it('applies hover effects to changelog card', async () => {
    render(<LauncherNewsFeed />);
    const changelogCard = screen.getByText('N CHANGELOG');
    fireEvent.mouseEnter(changelogCard);
    await waitFor(() => {
      expect(changelogCard).toHaveStyle('border-color: #404D6B');
      expect(changelogCard).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(changelogCard);
    await waitFor(() => {
      expect(changelogCard).toHaveStyle('border-color: #262E42');
      expect(changelogCard).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to new version card', async () => {
    render(<LauncherNewsFeed />);
    const newVersionCard = screen.getByText('NEW VERSION!');
    fireEvent.mouseEnter(newVersionCard);
    await waitFor(() => {
      expect(newVersionCard).toHaveStyle('border-color: #61F27A');
      expect(newVersionCard).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(newVersionCard);
    await waitFor(() => {
      expect(newVersionCard).toHaveStyle('border-color: #38734D');
      expect(newVersionCard).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to become a creator card', async () => {
    render(<LauncherNewsFeed />);
    const becomeCreatorCard = screen.getByText('BECOME A');
    fireEvent.mouseEnter(becomeCreatorCard);
    await waitFor(() => {
      expect(becomeCreatorCard).toHaveStyle('border-color: #FACC66');
      expect(becomeCreatorCard).toHaveStyle('transform: translateY(-2px)');
    });
    fireEvent.mouseLeave(becomeCreatorCard);
    await waitFor(() => {
      expect(becomeCreatorCard).toHaveStyle('border-color: #593826');
      expect(becomeCreatorCard).toHaveStyle('transform: translateY(0)');
    });
  });

  it('applies hover effects to new mods card', async () => {
    render(<LauncherNewsFeed />);
    const newModsCard = screen.getByText('NEW MODS!');
    fireEvent.mouseEnter(newModsCard);
    await waitFor(() => {
      expect(newModsCard).toHaveStyle('border-color: #FF7380');
      expect(newModsCard).toHaveStyle('transform: translateY(-1px)');
    });
    fireEvent.mouseLeave(newModsCard);
    await waitFor(() => {
      expect(newModsCard).toHaveStyle('border-color: rgba(64, 46, 56, 0.6)');
      expect(newModsCard).toHaveStyle('transform: translateY(0)');
    });
  });
});
