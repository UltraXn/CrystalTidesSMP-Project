import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CrystalClientView } from '../CrystalClientView';
import { useAuth } from '../services/authContext';
import { launchGame, LaunchParams } from '../services/launcherService';
import { getSettings } from '../services/settingsService';
import { getProfile, getProfiles } from '../services/profileService';
import { getFriends, getFriendRequests, Friend, FriendRequest } from '../services/friendsService';

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

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  m: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LazyMotion: ({ children }: any) => <>{children}</>,
  domAnimation: {},
}));

describe('CrystalClientView', () => {
  let mockCurrentSession: any;
  let mockLaunchGame: any;
  let mockGetSettings: any;
  let mockGetProfile: any;
  let mockGetProfiles: any;
  let mockGetFriends: any;
  let mockGetFriendRequests: any;

  beforeEach(() => {
    mockCurrentSession = {
      username: 'testUser',
      id: 'testId',
      accessToken: 'testToken',
    };

    mockLaunchGame = vi.fn();
    mockGetSettings = vi.fn().mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaArgs: '',
      javaPath: '/path/to/java',
    });

    mockGetProfile = vi.fn().mockReturnValue({
      mcVersion: '1.21.1',
      loaderType: 'neoforge',
      loaderVersion: '21.1.65',
      minRam: 2048,
      maxRam: 6144,
      useOptimization: true,
      gameDir: '/path/to/game',
      javaArgs: '',
      javaPath: '/path/to/java',
    });

    mockGetProfiles = vi.fn().mockReturnValue([
      { id: 'profile1', mcVersion: '1.21.1' },
    ]);

    mockGetFriends = vi.fn().mockReturnValue([
      { username: 'friend1', status: 'online', avatar: 'avatar1' },
    ]);

    mockGetFriendRequests = vi.fn().mockReturnValue([]);

    useAuth.mockReturnValue({ currentSession: mockCurrentSession });
    launchGame.mockImplementation(mockLaunchGame);
    getSettings.mockImplementation(mockGetSettings);
    getProfile.mockImplementation(mockGetProfile);
    getProfiles.mockImplementation(mockGetProfiles);
    getFriends.mockImplementation(mockGetFriends);
    getFriendRequests.mockImplementation(mockGetFriendRequests);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<CrystalClientView />);
    expect(screen.getByText('testUser')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides SMP')).toBeInTheDocument();
  });

  it('handles toggle connection status', async () => {
    render(<CrystalClientView />);
    const toggleButton = screen.getByRole('button', { name: /toggle connection/i });
    await waitFor(() => expect(toggleButton).toBeInTheDocument());
    await toggleButton.click();
    expect(screen.getByRole('button', { name: /toggle connection/i })).toHaveTextContent('Online');
  });

  it('handles launch game', async () => {
    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /launch game/i });
    await waitFor(() => expect(launchButton).toBeInTheDocument());
    await launchButton.click();
    expect(mockLaunchGame).toHaveBeenCalled();
  });

  it('handles launch game with no session', async () => {
    useAuth.mockReturnValue({ currentSession: null });
    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /launch game/i });
    await waitFor(() => expect(launchButton).toBeInTheDocument());
    await launchButton.click();
    expect(screen.getByText('Account Switcher')).toBeInTheDocument();
  });

  it('handles toggle pause', async () => {
    render(<CrystalClientView />);
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await waitFor(() => expect(pauseButton).toBeInTheDocument());
    await pauseButton.click();
    expect(mockLaunchGame).toHaveBeenCalled();
  });

  it('handles cancel download', async () => {
    render(<CrystalClientView />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await waitFor(() => expect(cancelButton).toBeInTheDocument());
    await cancelButton.click();
    expect(mockLaunchGame).not.toHaveBeenCalled();
  });

  it('handles send chat message', async () => {
    render(<CrystalClientView />);
    const chatInput = screen.getByRole('textbox');
    await waitFor(() => expect(chatInput).toBeInTheDocument());
    await chatInput.type('Hello');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await sendButton.click();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText("Let's run some games together!")).toBeInTheDocument();
  });

  it('renders friends panel correctly', async () => {
    render(<CrystalClientView />);
    expect(screen.getByText('friend1')).toBeInTheDocument();
  });

  it('renders chat popup correctly', async () => {
    render(<CrystalClientView />);
    const friendButton = screen.getByRole('button', { name: /friend1/i });
    await friendButton.click();
    expect(screen.getByText('friend1')).toBeInTheDocument();
  });

  it('renders account switcher modal correctly', async () => {
    render(<CrystalClientView />);
    const accountSwitcherButton = screen.getByRole('button', { name: /account switcher/i });
    await accountSwitcherButton.click();
    expect(screen.getByText('Account Switcher')).toBeInTheDocument();
  });

  it('renders crash modal correctly', async () => {
    render(<CrystalClientView />);
    const launchButton = screen.getByRole('button', { name: /launch game/i });
    await launchButton.click();
    expect(screen.getByText('Crash Reporter')).toBeInTheDocument();
  });
});
