import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../services/authContext';
import { launchGame } from '../../services/launcherService';
import { getSettings } from '../../services/settingsService';
import { getProfile, getProfiles } from '../../services/profileService';
import { getFriends, getFriendRequests } from '../../services/friendsService';
import { CrystalClientView } from '../CrystalClientView';

vi.mock('../../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/launcherService', () => ({
  launchGame: vi.fn(),
}));

vi.mock('../../services/settingsService', () => ({
  getSettings: vi.fn(),
}));

vi.mock('../../services/profileService', () => ({
  getProfile: vi.fn(),
  getProfiles: vi.fn(),
}));

vi.mock('../../services/friendsService', () => ({
  getFriends: vi.fn(),
  getFriendRequests: vi.fn(),
}));

const mockMinimize = vi.fn();
const mockToggleMaximize = vi.fn();
const mockClose = vi.fn();
const mockStartDragging = vi.fn();

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    minimize: mockMinimize,
    toggleMaximize: mockToggleMaximize,
    close: mockClose,
    startDragging: mockStartDragging,
  })),
}));

describe('CrystalClientView', () => {
  const mockCurrentSession = {
    username: 'testUser',
    id: 'testId',
    accessToken: 'testToken',
    skinUrl: 'https://example.com/skin.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      currentSession: mockCurrentSession,
      savedAccounts: [],
      switchAccount: vi.fn(),
      removeAccount: vi.fn(),
      addAccount: vi.fn(),
    });
    (getSettings as Mock).mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaPath: '/path/to/java',
    });
    (getProfile as Mock).mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaArgs: '-Xmx4096M',
    });
    (getProfiles as Mock).mockReturnValue([{ id: 'hypixel', name: 'Hypixel' }]);
    (getFriends as Mock).mockReturnValue([
      { username: 'friend1', status: 'online', avatar: 'https://example.com/avatar1.png' },
      { username: 'friend2', status: 'offline', avatar: 'https://example.com/avatar2.png' },
    ]);
    (getFriendRequests as Mock).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component and initial state', () => {
    render(<CrystalClientView />);
    expect(screen.getByText('testUser')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides SMP')).toBeInTheDocument();
    expect(screen.getByText('1,364h')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LAUNCH/i })).toBeInTheDocument();
  });

  it('handles toggle connection status between online and offline', () => {
    render(<CrystalClientView />);
    const toggleButton = screen.getByRole('button', { name: /• Ver Offline/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('• Conectar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PLAY OFFLINE/i })).toBeInTheDocument();
  });

  it('handles window minimize', async () => {
    render(<CrystalClientView />);
    const minimizeButton = screen.getByRole('button', { name: /minimize/i });
    fireEvent.click(minimizeButton);
    await waitFor(() => expect(mockMinimize).toHaveBeenCalled());
  });

  it('handles window maximize', async () => {
    render(<CrystalClientView />);
    const maximizeButton = screen.getByRole('button', { name: /maximize/i });
    fireEvent.click(maximizeButton);
    await waitFor(() => expect(mockToggleMaximize).toHaveBeenCalled());
  });

  it('handles window close', async () => {
    render(<CrystalClientView />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => expect(mockClose).toHaveBeenCalled());
  });

  it('handles start drag on titlebar header', async () => {
    render(<CrystalClientView />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    fireEvent.mouseDown(header!, { button: 0 });
    await waitFor(() => expect(mockStartDragging).toHaveBeenCalled());
  });

  it('handles launching the game successfully', async () => {
    const launchGameMock = launchGame as Mock;
    launchGameMock.mockImplementation(
      (_params: any, onProgress: (msg: string, pct: number) => void) => {
        onProgress('Iniciando...', 0.5);
        return Promise.resolve();
      },
    );

    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /LAUNCH/i });
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(launchGameMock).toHaveBeenCalled();
    });
  });

  it('handles crash modal open when launch game rejects', async () => {
    const launchGameMock = launchGame as Mock;
    launchGameMock.mockRejectedValue(new Error('Minecraft crashed'));

    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /LAUNCH/i });
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(screen.getByText(/Game Crash Detected/i)).toBeInTheDocument();
    });
  });

  it('opens account switcher modal when profile badge is clicked', () => {
    render(<CrystalClientView />);
    const accountSwitcherBadge = screen.getByTitle('Cambiar de cuenta');
    fireEvent.click(accountSwitcherBadge);
    expect(screen.getByText(/Perfiles de Minecraft/i)).toBeInTheDocument();
  });

  it('switches navigation tab when sidebar item is clicked', () => {
    render(<CrystalClientView />);
    const lockerNav = screen.getByTitle('Locker');
    fireEvent.click(lockerNav);
    expect(screen.getByText('LOCKER')).toBeInTheDocument();
  });

  it('handles fallback gracefully when no user session is active', () => {
    (useAuth as Mock).mockReturnValue({
      currentSession: null,
      savedAccounts: [],
      switchAccount: vi.fn(),
      removeAccount: vi.fn(),
      addAccount: vi.fn(),
    });
    render(<CrystalClientView />);
    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('handles empty profiles list without crashing', () => {
    (getProfiles as Mock).mockReturnValue([]);
    (getProfile as Mock).mockReturnValue(undefined);
    render(<CrystalClientView />);
    expect(screen.getByText('testUser')).toBeInTheDocument();
  });
});
