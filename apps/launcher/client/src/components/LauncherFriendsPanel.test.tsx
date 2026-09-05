import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherFriendsPanel } from './LauncherFriendsPanel';
import { FriendEntry, FriendRequest } from './types';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, toggleFavoriteFriend } from '../services/friendsService';

vi.mock('../services/friendsService', () => ({
  sendFriendRequest: vi.fn(),
  acceptFriendRequest: vi.fn(),
  rejectFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
  toggleFavoriteFriend: vi.fn(),
}));

const mockFriendsOnline: FriendEntry[] = [
  { name: 'Alice', avatar: 'avatar1.png', statusType: 'online', status: 'Online', hasUnreadMessage: false },
  { name: 'Bob', avatar: 'avatar2.png', statusType: 'offline', status: 'Offline', hasUnreadMessage: true },
];

const mockFriendsOffline: FriendEntry[] = [
  { name: 'Charlie', avatar: 'avatar3.png', statusType: 'offline', status: 'Offline', hasUnreadMessage: false },
];

const mockFriendRequests: FriendRequest[] = [
  { id: '1', username: 'David', avatar: 'avatar4.png', sentAt: '2023-10-01' },
];

describe('LauncherFriendsPanel', () => {
  beforeEach(() => {
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

  it('renders the component with friend requests', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes Pendientes (1)')).toBeInTheDocument();
  });

  it('renders the add friend modal and handles form submission', async () => {
    const onSearchFriendChange = vi.fn();
    const handleSendRequest = vi.fn();
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={onSearchFriendChange}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getByLabelText('Add Friend'));
    fireEvent.change(screen.getByPlaceholderText('Username de Minecraft...'), { target: { value: 'Eve' } });
    fireEvent.submit(screen.getByText('Enviar'));
    await waitFor(() => expect(sendFriendRequest).toHaveBeenCalledWith('Eve'));
  });

  it('handles accept friend request', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getByTitle('Aceptar'));
    expect(acceptFriendRequest).toHaveBeenCalledWith('1');
  });

  it('handles reject friend request', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={mockFriendRequests}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getByTitle('Rechazar'));
    expect(rejectFriendRequest).toHaveBeenCalledWith('1');
  });

  it('handles remove friend', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getAllByTitle('Remove Friend')[0]);
    expect(removeFriend).toHaveBeenCalledWith('Alice');
  });

  it('handles toggle favorite friend', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getAllByTitle('Favorite')[0]);
    expect(toggleFavoriteFriend).toHaveBeenCalledWith('Alice');
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

  it('renders empty state when no friend requests are present', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      friendRequests={[]}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    expect(screen.getByText('No tienes solicitudes de amistad pendientes.')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    const onSearchFriendChange = vi.fn();
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={onSearchFriendChange}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.change(screen.getByPlaceholderText('Find a player...'), { target: { value: 'search' } });
    expect(onSearchFriendChange).toHaveBeenCalledWith('search');
  });

  it('handles tab switching', () => {
    render(<LauncherFriendsPanel
      friendsOnline={mockFriendsOnline}
      friendsOffline={mockFriendsOffline}
      searchFriend=""
      onSearchFriendChange={vi.fn()}
      onSelectFriendChat={vi.fn()}
    />);
    fireEvent.click(screen.getByText('Requests'));
    expect(screen.getByText('Solicitudes Pendientes (0)')).toBeInTheDocument();
  });
});
