import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../services/authContext';
import { LauncherRelayChatView } from './LauncherRelayChatView';

vi.mock('../services/authContext', () => ({
  useAuth: vi.fn(),
}));

describe('LauncherRelayChatView', () => {
  const mockAuth = {
    currentSession: {
      username: 'testUser',
    },
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default channels and messages', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText('Crystal Relay')).toBeInTheDocument();
    expect(screen.getByText('global')).toBeInTheDocument();
    expect(screen.getByText('anuncios')).toBeInTheDocument();
    expect(screen.getByText('clanes-squads')).toBeInTheDocument();
    expect(screen.getByText('soporte-staff')).toBeInTheDocument();
    expect(screen.getByText('¡Bienvenidos al Relay de CrystalTides!')).toBeInTheDocument();
  });

  it('handles sending a message', async () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Enviar mensaje a #global...');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.submit(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('testUser')).toBeInTheDocument();
    });
  });

  it('handles adding a friend', async () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'newFriend' } });
    fireEvent.submit(screen.getByText('Iniciar Chat'));

    await waitFor(() => {
      expect(screen.getByText('newFriend')).toBeInTheDocument();
    });
  });

  it('filters channels by search', async () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Buscar canal o amigo...');
    fireEvent.change(input, { target: { value: 'anuncios' } });

    await waitFor(() => {
      expect(screen.getByText('anuncios')).toBeInTheDocument();
      expect(screen.queryByText('global')).not.toBeInTheDocument();
    });
  });

  it('handles empty search', async () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Buscar canal o amigo...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText('anuncios')).not.toBeInTheDocument();
      expect(screen.queryByText('global')).not.toBeInTheDocument();
    });
  });

  it('renders direct messages section', async () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'newFriend' } });
    fireEvent.submit(screen.getByText('Iniciar Chat'));

    await waitFor(() => {
      expect(screen.getByText('Mensajes Directos')).toBeInTheDocument();
      expect(screen.getByText('newFriend')).toBeInTheDocument();
    });
  });

  it('renders no direct messages section', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText('Mensajes Directos')).toBeInTheDocument();
    expect(screen.getByText('Sin chats privados')).toBeInTheDocument();
  });

  it('handles clicking on a channel', async () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('anuncios'));

    await waitFor(() => {
      expect(screen.getByText('anuncios')).toBeInTheDocument();
      expect(screen.getByText('Novedades oficiales, torneos y actualizaciones')).toBeInTheDocument();
    });
  });

  it('handles clicking on a direct message', async () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'newFriend' } });
    fireEvent.submit(screen.getByText('Iniciar Chat'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('newFriend'));
      expect(screen.getByText('newFriend')).toBeInTheDocument();
      expect(screen.getByText('¡Hola testUser!')).toBeInTheDocument();
    });
  });

  it('handles empty message input', () => {
    render(<LauncherRelayChatView />);
    fireEvent.submit(screen.getByText('Enviar'));
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });

  it('handles empty friend nickname', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    fireEvent.submit(screen.getByText('Iniciar Chat'));
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });

  it('renders empty state for no messages', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText('Sé el primero en enviar un mensaje en este canal.')).toBeInTheDocument();
  });

  it('renders empty state for no direct messages', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText('Sin chats privados')).toBeInTheDocument();
  });

  it('handles closing the add friend modal', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    fireEvent.click(screen.getByText('Cerrar'));
    expect(screen.queryByText('Nickname de amigo...')).not.toBeInTheDocument();
  });

  it('handles invalid friend nickname', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'a'.repeat(17) } });
    fireEvent.submit(screen.getByText('Iniciar Chat'));
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });

  it('handles invalid message input', () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Enviar mensaje a #global...');
    fireEvent.change(input, { target: { value: ' '.repeat(100) } });
    fireEvent.submit(screen.getByText('Enviar'));
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });

  it('handles invalid search input', () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Buscar canal o amigo...');
    fireEvent.change(input, { target: { value: ' '.repeat(100) } });
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });
});
