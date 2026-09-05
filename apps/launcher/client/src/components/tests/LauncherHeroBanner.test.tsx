import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherHeroBanner from '../LauncherHeroBanner';
import { fetchServerStatus } from '../services/serverStatusService';

vi.mock('../services/serverStatusService', () => ({
  fetchServerStatus: vi.fn(),
}));

vi.mock('morphicons/react', () => ({
  MorphIcon: ({ icon, size, color, strokeWidth }: any) => (
    <svg width={size} height={size} style={{ color, strokeWidth }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
}));

vi.mock('lucide', () => ({
  Sun: 'SunIcon',
  Moon: 'MoonIcon',
}));

describe('LauncherHeroBanner', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<LauncherHeroBanner />);
    expect(screen.getByText(/Good to see you,/i)).toBeInTheDocument();
    expect(screen.getByText(/dbrn/i)).toBeInTheDocument();
    expect(screen.getByText(/CrystalTides SMP/i)).toBeInTheDocument();
    expect(screen.getByText(/Recently/i)).toBeInTheDocument();
    expect(screen.getByText(/1,364h/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Night/i })).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    const props = {
      playerName: 'TestPlayer',
      playerAvatar: 'https://example.com/avatar.png',
      lastPlayedServer: 'TestServer',
      lastPlayedTime: 'Yesterday',
      totalPlaytime: '500h',
      wallpaperMode: 'day' as WallpaperMode,
      onSelectWallpaperMode: vi.fn(),
      onOpenAccountSwitcher: vi.fn(),
    };

    render(<LauncherHeroBanner {...props} />);
    expect(screen.getByText(/Good to see you,/i)).toBeInTheDocument();
    expect(screen.getByText(/TestPlayer/i)).toBeInTheDocument();
    expect(screen.getByText(/TestServer/i)).toBeInTheDocument();
    expect(screen.getByText(/Yesterday/i)).toBeInTheDocument();
    expect(screen.getByText(/500h/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Night/i })).toBeInTheDocument();
  });

  it('calls onOpenAccountSwitcher when account switcher is clicked', async () => {
    const onOpenAccountSwitcher = vi.fn();
    render(<LauncherHeroBanner onOpenAccountSwitcher={onOpenAccountSwitcher} />);
    const accountSwitcher = screen.getByTitle(/Cambiar de cuenta/i);
    await user.click(accountSwitcher);
    expect(onOpenAccountSwitcher).toHaveBeenCalled();
  });

  it('does not call onOpenAccountSwitcher when account switcher is not provided', async () => {
    render(<LauncherHeroBanner />);
    const accountSwitcher = screen.getByTitle(/Cambiar de cuenta/i);
    await user.click(accountSwitcher);
    expect(accountSwitcher).toHaveAttribute('style', 'cursor: default;');
  });

  it('renders server status when online', async () => {
    (fetchServerStatus as vi.Mock).mockResolvedValue({ online: true, playersOnline: 10 });
    render(<LauncherHeroBanner />);
    await waitFor(() => {
      expect(screen.getByText(/10 Online/i)).toBeInTheDocument();
    });
  });

  it('does not render server status when offline', async () => {
    (fetchServerStatus as vi.Mock).mockResolvedValue({ online: false });
    render(<LauncherHeroBanner />);
    await waitFor(() => {
      expect(screen.queryByText(/Online/i)).not.toBeInTheDocument();
    });
  });

  it('calls onSelectWallpaperMode with "day" when day button is clicked', async () => {
    const onSelectWallpaperMode = vi.fn();
    render(<LauncherHeroBanner onSelectWallpaperMode={onSelectWallpaperMode} />);
    const dayButton = screen.getByRole('button', { name: /Day/i });
    await user.click(dayButton);
    expect(onSelectWallpaperMode).toHaveBeenCalledWith('day');
  });

  it('calls onSelectWallpaperMode with "night" when night button is clicked', async () => {
    const onSelectWallpaperMode = vi.fn();
    render(<LauncherHeroBanner onSelectWallpaperMode={onSelectWallpaperMode} />);
    const nightButton = screen.getByRole('button', { name: /Night/i });
    await user.click(nightButton);
    expect(onSelectWallpaperMode).toHaveBeenCalledWith('night');
  });

  it('renders day button with active styles when wallpaperMode is "day"', () => {
    render(<LauncherHeroBanner wallpaperMode="day" />);
    const dayButton = screen.getByRole('button', { name: /Day/i });
    expect(dayButton).toHaveStyle('background-color: #1F2638;');
    expect(dayButton).toHaveStyle('color: #FAFCFF;');
  });

  it('renders night button with active styles when wallpaperMode is "night"', () => {
    render(<LauncherHeroBanner wallpaperMode="night" />);
    const nightButton = screen.getByRole('button', { name: /Night/i });
    expect(nightButton).toHaveStyle('background-color: #1F2638;');
    expect(nightButton).toHaveStyle('color: #FAFCFF;');
  });
});
