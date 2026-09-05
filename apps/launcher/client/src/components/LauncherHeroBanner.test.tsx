import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherHeroBanner } from './LauncherHeroBanner';
import { fetchServerStatus } from '../services/serverStatusService';

vi.mock('../services/serverStatusService', () => ({
  fetchServerStatus: vi.fn(),
}));

describe('LauncherHeroBanner', () => {
  const defaultProps = {
    playerName: 'dbrn',
    playerAvatar: 'https://mc-heads.net/avatar/dbrn/24',
    lastPlayedServer: 'CrystalTides SMP',
    lastPlayedTime: 'Recently',
    totalPlaytime: '1,364h',
    wallpaperMode: 'day' as WallpaperMode,
    onSelectWallpaperMode: vi.fn(),
    onOpenAccountSwitcher: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders player greeting and playtime details correctly', () => {
    render(<LauncherHeroBanner {...defaultProps} />);
    expect(screen.getByText('Good to see you,')).toBeInTheDocument();
    expect(screen.getByAltText('dbrn')).toBeInTheDocument();
    expect(screen.getByText('dbrn')).toBeInTheDocument();
    expect(screen.getByText('Last played:')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides SMP')).toBeInTheDocument();
    expect(screen.getByText('Recently')).toBeInTheDocument();
    expect(screen.getByText('Total playtime:')).toBeInTheDocument();
    expect(screen.getByText('1,364h')).toBeInTheDocument();
  });

  it('renders server status when available', async () => {
    fetchServerStatus.mockResolvedValueOnce({ online: true, playersOnline: 10 });
    render(<LauncherHeroBanner {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('10 Online')).toBeInTheDocument();
    });
  });

  it('renders server status offline when not available', async () => {
    fetchServerStatus.mockResolvedValueOnce({ online: false });
    render(<LauncherHeroBanner {...defaultProps} />);
    await waitFor(() => {
      expect(screen.queryByText('Online')).not.toBeInTheDocument();
    });
  });

  it('calls onSelectWallpaperMode with "day" when day button is clicked', () => {
    render(<LauncherHeroBanner {...defaultProps} />);
    fireEvent.click(screen.getByText('Day'));
    expect(defaultProps.onSelectWallpaperMode).toHaveBeenCalledWith('day');
  });

  it('calls onSelectWallpaperMode with "night" when night button is clicked', () => {
    render(<LauncherHeroBanner {...defaultProps} />);
    fireEvent.click(screen.getByText('Night'));
    expect(defaultProps.onSelectWallpaperMode).toHaveBeenCalledWith('night');
  });

  it('renders day button with active styles', () => {
    render(<LauncherHeroBanner {...defaultProps} />);
    const dayButton = screen.getByText('Day');
    expect(dayButton).toHaveStyle('background-color: #1F2638');
    expect(dayButton).toHaveStyle('color: #FAFCFF');
  });

  it('renders night button with active styles', () => {
    render(<LauncherHeroBanner {...defaultProps} wallpaperMode="night" />);
    const nightButton = screen.getByText('Night');
    expect(nightButton).toHaveStyle('background-color: #1F2638');
    expect(nightButton).toHaveStyle('color: #FAFCFF');
  });

  it('renders account switcher button with correct styles and tooltip', () => {
    render(<LauncherHeroBanner {...defaultProps} />);
    const accountSwitcher = screen.getByTitle('Cambiar de cuenta');
    expect(accountSwitcher).toHaveStyle('cursor: pointer');
    expect(accountSwitcher).toHaveStyle('background-color: #11131C');
    expect(accountSwitcher).toHaveStyle('border-color: #262E42');
  });

  it('does not render account switcher button when onOpenAccountSwitcher is not provided', () => {
    render(<LauncherHeroBanner {...defaultProps} onOpenAccountSwitcher={undefined} />);
    const accountSwitcher = screen.queryByTitle('Cambiar de cuenta');
    expect(accountSwitcher).toHaveStyle('cursor: default');
    expect(accountSwitcher).toHaveStyle('background-color: #11131C');
    expect(accountSwitcher).toHaveStyle('border-color: #262E42');
  });

  it('handles optional props gracefully', () => {
    render(<LauncherHeroBanner wallpaperMode="day" onSelectWallpaperMode={vi.fn()} />);
    expect(screen.getByText('Good to see you,')).toBeInTheDocument();
    expect(screen.getByText('Last played:')).toBeInTheDocument();
    expect(screen.getByText('Total playtime:')).toBeInTheDocument();
  });

  it('handles empty strings and null values gracefully', () => {
    render(<LauncherHeroBanner {...defaultProps} playerName="" playerAvatar="" lastPlayedServer="" lastPlayedTime="" totalPlaytime="" />);
    expect(screen.getByText('Good to see you,')).toBeInTheDocument();
    expect(screen.getByText('Last played:')).toBeInTheDocument();
    expect(screen.getByText('Total playtime:')).toBeInTheDocument();
  });

  it('handles undefined values gracefully', () => {
    render(<LauncherHeroBanner wallpaperMode="day" onSelectWallpaperMode={vi.fn()} />);
    expect(screen.getByText('Good to see you,')).toBeInTheDocument();
    expect(screen.getByText('Last played:')).toBeInTheDocument();
    expect(screen.getByText('Total playtime:')).toBeInTheDocument();
  });
});
