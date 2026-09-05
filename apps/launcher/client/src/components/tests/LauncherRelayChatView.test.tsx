import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../../services/authContext';
import LauncherRelayChatView from '../LauncherRelayChatView';

vi.mock('../../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('morphicons/react', () => ({
  MorphIcon: ({ icon, size, color, strokeWidth }) => (
    <svg width={size} height={size} style={{ color, strokeWidth }}>
      <use href={`#${icon}`} />
    </svg>
  ),
}));

describe('LauncherRelayChatView', () => {
  const mockAuth = {
    currentSession: {
      username: 'TestUser',
    },
  };

  beforeEach(() => {
    useAuth.mockReturnValue(mockAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default channels and messages', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText(/Crystal Relay/i)).toBeInTheDocument();
    expect(screen.getByText(/global/i)).toBeInTheDocument();
    expect(screen.getByText(/anuncios/i)).toBeInTheDocument();
    expect(screen.getByText(/clanes/i)).toBeInTheDocument();
    expect(screen.getByText(/ayuda/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Bienvenidos al Relay de CrystalTides!/i)).toBeInTheDocument();
  });

  it('handles search filter correctly', async () => {
    render(<LauncherRelayChatView />);
    const searchInput = screen.getByPlaceholderText(/Buscar canal o amigo.../i);
    await userEvent.type(searchInput, 'anuncios');
    expect(screen.getByText(/anuncios/i)).toBeInTheDocument();
    expect(screen.queryByText(/global/i)).not.toBeInTheDocument();
  });

  it('handles adding a new friend', async () => {
    render(<LauncherRelayChatView />);
    const addFriendButton = screen.getByRole('button', { name: /Añadir/i });
    await userEvent.click(addFriendButton);
    const addFriendInput = screen.getByPlaceholderText(/Nickname de amigo.../i);
    await userEvent.type(addFriendInput, 'NewFriend');
    const submitButton = screen.getByRole('button', { name: /Iniciar Chat/i });
    await userEvent.click(submitButton);
    expect(screen.getByText(/NewFriend/i)).toBeInTheDocument();
  });

  it('handles sending a message', async () => {
    render(<LauncherRelayChatView />);
    const messageInput = screen.getByPlaceholderText(/Enviar mensaje a #global.../i);
    await userEvent.type(messageInput, 'Hello World');
    const sendButton = screen.getByRole('button', { name: /Enviar/i });
    await userEvent.click(sendButton);
    expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  });

  it('handles active channel change', async () => {
    render(<LauncherRelayChatView />);
    const channelButton = screen.getByRole('button', { name: /anuncios/i });
    await userEvent.click(channelButton);
    expect(screen.getByText(/anuncios/i)).toBeInTheDocument();
    expect(screen.getByText(/Novedades oficiales, torneos y actualizaciones/i)).toBeInTheDocument();
  });

  it('renders direct messages correctly', async () => {
    render(<LauncherRelayChatView />);
    const addFriendButton = screen.getByRole('button', { name: /Añadir/i });
    await userEvent.click(addFriendButton);
    const addFriendInput = screen.getByPlaceholderText(/Nickname de amigo.../i);
    await userEvent.type(addFriendInput, 'NewFriend');
    const submitButton = screen.getByRole('button', { name: /Iniciar Chat/i });
    await userEvent.click(submitButton);
    expect(screen.getByText(/¡Hola TestUser!/i)).toBeInTheDocument();
  });

  it('handles empty message input', async () => {
    render(<LauncherRelayChatView />);
    const messageInput = screen.getByPlaceholderText(/Enviar mensaje a #global.../i);
    await userEvent.type(messageInput, '   ');
    const sendButton = screen.getByRole('button', { name: /Enviar/i });
    await userEvent.click(sendButton);
    expect(screen.queryByText(/   /i)).not.toBeInTheDocument();
  });

  it('handles closing add friend modal', async () => {
    render(<LauncherRelayChatView />);
    const addFriendButton = screen.getByRole('button', { name: /Añadir/i });
    await userEvent.click(addFriendButton);
    const closeAddFriendButton = screen.getByRole('button', { name: /Cerrar/i });
    await userEvent.click(closeAddFriendButton);
    expect(screen.queryByPlaceholderText(/Nickname de amigo.../i)).not.toBeInTheDocument();
  });
});
