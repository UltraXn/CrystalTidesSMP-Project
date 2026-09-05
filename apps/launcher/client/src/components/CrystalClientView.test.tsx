import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../services/authContext';
import { launchGame, LaunchParams } from '../services/launcherService';
import { getSettings } from '../services/settingsService';
import { getProfile, getProfiles } from '../services/profileService';
import { getFriends, getFriendRequests, Friend, FriendRequest } from '../services/friendsService';
import { CrystalClientView } from './CrystalClientView';

vi.mock('../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/launcherService', () => ({
  launchGame: vi.fn(),
}));

vi.mock('../services/settingsService', () => ({
  getSettings: vi.fn(),
}));

vi.mock('../services/profileService', () => ({
  getProfile: vi.fn(),
  getProfiles: vi.fn(),
}));

vi.mock('../services/friendsService', () => ({
  getFriends: vi.fn(),
  getFriendRequests: vi.fn(),
}));

describe('CrystalClientView', () => {
  const mockCurrentSession = {
    username: 'testUser',
    id: 'testId',
    accessToken: 'testToken',
    skinUrl: 'https://example.com/skin.png',
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({ currentSession: mockCurrentSession });
    (getSettings as vi.Mock).mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaPath: '/path/to/java',
    });
    (getProfile as vi.Mock).mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaArgs: '-Xmx4096M',
    });
    (getProfiles as vi.Mock).mockReturnValue([
      { id: 'hypixel', name: 'Hypixel' },
    ]);
    (getFriends as vi.Mock).mockReturnValue([
      { username: 'friend1', status: 'online', avatar: 'https://example.com/avatar1.png' },
      { username: 'friend2', status: 'offline', avatar: 'https://example.com/avatar2.png' },
    ]);
    (getFriendRequests as vi.Mock).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component and initial state', () => {
    render(<CrystalClientView />);
    expect(screen.getByText('testUser')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides SMP')).toBeInTheDocument();
    expect(screen.getByText('1,364h')).toBeInTheDocument();
  });

  it('handles toggle connection status', () => {
    render(<CrystalClientView />);
    const toggleButton = screen.getByRole('button', { name: /toggle connection/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /toggle connection/i })).toHaveTextContent('Go Online');
  });

  it('handles minimize window', async () => {
    const minimize = vi.fn();
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: vi.fn().mockResolvedValue({ minimize }),
    }));
    render(<CrystalClientView />);
    const minimizeButton = screen.getByRole('button', { name: /minimize/i });
    fireEvent.click(minimizeButton);
    await waitFor(() => expect(minimize).toHaveBeenCalled());
  });

  it('handles maximize window', async () => {
    const toggleMaximize = vi.fn();
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: vi.fn().mockResolvedValue({ toggleMaximize }),
    }));
    render(<CrystalClientView />);
    const maximizeButton = screen.getByRole('button', { name: /maximize/i });
    fireEvent.click(maximizeButton);
    await waitFor(() => expect(toggleMaximize).toHaveBeenCalled());
  });

  it('handles close window', async () => {
    const close = vi.fn();
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: vi.fn().mockResolvedValue({ close }),
    }));
    render(<CrystalClientView />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => expect(close).toHaveBeenCalled());
  });

  it('handles start drag', async () => {
    const startDragging = vi.fn();
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: vi.fn().mockResolvedValue({ startDragging }),
    }));
    render(<CrystalClientView />);
    const titleBar = screen.getByRole('region', { name: /title bar/i });
    fireEvent.mouseDown(titleBar);
    await waitFor(() => expect(startDragging).toHaveBeenCalled());
  });

  it('handles launch game', async () => {
    const launchGameMock = launchGame as vi.Mock;
    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /launch/i });
    fireEvent.click(launchButton);
    await waitFor(() => expect(launchGameMock).toHaveBeenCalled());
  });

  it('handles toggle pause download', () => {
    render(<CrystalClientView />);
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
  });

  it('handles cancel download', () => {
    render(<CrystalClientView />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.getByRole('button', { name: /launch/i })).toBeInTheDocument();
  });

  it('handles send chat message', () => {
    render(<CrystalClientView />);
    const chatInput = screen.getByRole('textbox', { name: /chat/i });
    fireEvent.change(chatInput, { target: { value: 'Hello' } });
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles account switcher open', () => {
    render(<CrystalClientView />);
    const accountSwitcherButton = screen.getByRole('button', { name: /account switcher/i });
    fireEvent.click(accountSwitcherButton);
    expect(screen.getByRole('dialog', { name: /account switcher/i })).toBeInTheDocument();
  });

  it('handles crash modal open', () => {
    render(<CrystalClientView />);
    const launchGameMock = launchGame as vi.Mock;
    launchGameMock.mockRejectedValue(new Error('Launch failed'));
    const launchButton = screen.getByRole('button', { name: /launch/i });
    fireEvent.click(launchButton);
    expect(screen.getByRole('dialog', { name: /crash reporter/i })).toBeInTheDocument();
  });

  it('handles boundary case: no current session', () => {
    (useAuth as vi.Mock).mockReturnValue({ currentSession: null });
    render(<CrystalClientView />);
    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('handles boundary case: empty friends list', () => {
    (getFriends as vi.Mock).mockReturnValue([]);
    render(<CrystalClientView />);
    expect(screen.getByText('No friends online')).toBeInTheDocument();
  });

  it('handles boundary case: empty friend requests list', () => {
    (getFriendRequests as vi.Mock).mockReturnValue([]);
    render(<CrystalClientView />);
    expect(screen.getByText('No friend requests')).toBeInTheDocument();
  });

  it('handles boundary case: empty chat messages', () => {
    render(<CrystalClientView />);
    expect(screen.getByText('No messages')).toBeInTheDocument();
  });

  it('handles boundary case: empty profiles list', () => {
    (getProfiles as vi.Mock).mockReturnValue([]);
    render(<CrystalClientView />);
    expect(screen.getByText('No profiles available')).toBeInTheDocument();
  });

  it('handles boundary case: empty settings', () => {
    (getSettings as vi.Mock).mockReturnValue({});
    render(<CrystalClientView />);
    expect(screen.getByText('Default settings')).toBeInTheDocument();
  });

  it('handles boundary case: empty profile', () => {
    (getProfile as vi.Mock).mockReturnValue({});
    render(<CrystalClientView />);
    expect(screen.getByText('Default profile')).toBeInTheDocument();
  });

  it('handles boundary case: empty launch parameters', () => {
    const launchGameMock = launchGame as vi.Mock;
    launchGameMock.mockImplementation((params: LaunchParams, callback: (statusText: string, progressFraction: number) => void) => {
      callback('Launching...', 0.5);
    });
    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /launch/i });
    fireEvent.click(launchButton);
    expect(screen.getByText('Launching...')).toBeInTheDocument();
  });
});
