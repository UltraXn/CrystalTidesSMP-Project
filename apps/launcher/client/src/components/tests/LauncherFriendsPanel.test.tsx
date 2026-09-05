import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherFriendsPanel from '../LauncherFriendsPanel';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button> },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('../services/friendsService', () => ({
  sendFriendRequest: vi.fn(),
  acceptFriendRequest: vi.fn(),
  rejectFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
  toggleFavoriteFriend: vi.fn(),
}));

const mockFriendsOnline: FriendEntry[] = [
  { name: 'Alice', statusType: 'online', status: 'Online', avatar: 'avatar1.png', hasUnreadMessage: false },
  { name: 'Bob', statusType: 'offline', status: 'Offline', avatar: 'avatar2.png', hasUnreadMessage: true },
];

const mockFriendsOffline: FriendEntry[] = [
  { name: 'Charlie', statusType: 'offline', status: 'Offline', avatar: 'avatar3.png', hasUnreadMessage: false },
];

const mockFriendRequests: FriendRequest[] = [
  { id: '1', username: 'David', avatar: 'avatar4.png', sentAt: '2023-10-01' },
];

describe('LauncherFriendsPanel', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with friends online and offline', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders the add friend modal and sends a request', async () => {
    const mockSendFriendRequest = vi.mocked(sendFriendRequest);
    mockSendFriendRequest.mockResolvedValue({ message: 'Friend request sent', success: true });

    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByRole('button', { name: /Add Friend/i }));
    await user.type(screen.getByRole('textbox'), 'Eve');
    await user.click(screen.getByRole('button', { name: /Enviar/i }));

    expect(mockSendFriendRequest).toHaveBeenCalledWith('Eve');
    expect(screen.getByText('Friend request sent')).toBeInTheDocument();
  });

  it('handles friend request acceptance', async () => {
    const mockAcceptFriendRequest = vi.mocked(acceptFriendRequest);

    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByRole('button', { name: /Aceptar/i }));

    expect(mockAcceptFriendRequest).toHaveBeenCalledWith('1');
  });

  it('handles friend request rejection', async () => {
    const mockRejectFriendRequest = vi.mocked(rejectFriendRequest);

    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByRole('button', { name: /Rechazar/i }));

    expect(mockRejectFriendRequest).toHaveBeenCalledWith('1');
  });

  it('handles friend removal', async () => {
    const mockRemoveFriend = vi.mocked(removeFriend);

    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByRole('button', { name: /Remove Friend/i }));

    expect(mockRemoveFriend).toHaveBeenCalledWith('Alice');
  });

  it('handles friend favoriting', async () => {
    const mockToggleFavoriteFriend = vi.mocked(toggleFavoriteFriend);

    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByRole('button', { name: /Favorite/i }));

    expect(mockToggleFavoriteFriend).toHaveBeenCalledWith('Alice');
  });

  it('renders empty state when no friends are found', () => {
    render(<LauncherFriendsPanel
      friendsOnline={[]}
      friendsOffline={[]}
      searchFriend="NonExistent"
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    expect(screen.getByText('No se encontraron jugadores')).toBeInTheDocument();
  });

  it('renders empty state when no friends are added', () => {
    render(<LauncherFriendsPanel
      friendsOnline={[]}
      friendsOffline={[]}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    expect(screen.getByText('No tienes amigos aún')).toBeInTheDocument();
  });

  it('renders the friends tab by default', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    expect(screen.getByText('Friends')).toHaveStyle('color: #FAFCFF');
    expect(screen.getByText('Requests')).toHaveStyle('color: #73809E');
  });

  it('renders the requests tab when clicked', async () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);

    await user.click(screen.getByText('Requests'));

    expect(screen.getByText('Friends')).toHaveStyle('color: #73809E');
    expect(screen.getByText('Requests')).toHaveStyle('color: #FAFCFF');
  });
});
