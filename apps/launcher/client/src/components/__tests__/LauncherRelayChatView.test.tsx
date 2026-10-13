import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../services/authContext';
import { LauncherRelayChatView } from '../LauncherRelayChatView';

vi.mock('../../services/authContext', () => ({
  useAuth: vi.fn(),
}));

describe('LauncherRelayChatView', () => {
  const mockAuth = {
    currentSession: {
      username: 'testUser',
    },
  };

  beforeEach(() => {
    (useAuth as Mock).mockReturnValue(mockAuth);
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
    expect(screen.getByText(/¡Bienvenidos al Relay de CrystalTides!/i)).toBeInTheDocument();
  });

  it('handles sending a message', async () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Enviar mensaje a #global...');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.submit(input.closest('form')!);

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
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getAllByText('newFriend').length).toBeGreaterThanOrEqual(1);
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
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Mensajes Directos')).toBeInTheDocument();
      expect(screen.getAllByText('newFriend').length).toBeGreaterThanOrEqual(1);
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
      expect(
        screen.getByText('Novedades oficiales, torneos y actualizaciones'),
      ).toBeInTheDocument();
    });
  });

  it('handles clicking on a direct message', async () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'newFriend' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getAllByText('newFriend').length).toBeGreaterThanOrEqual(1);
    });

    const friendItem = screen.getAllByText('newFriend')[0];
    fireEvent.click(friendItem);

    await waitFor(() => {
      expect(
        screen.getByText(/¡Hola testUser! Conectado a través de Crystal Relay\./i),
      ).toBeInTheDocument();
    });
  });

  it('handles empty message input', () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Enviar mensaje a #global...');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/¡Bienvenidos al Relay de CrystalTides!/i)).toBeInTheDocument();
  });

  it('handles empty friend nickname', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    fireEvent.submit(screen.getByText('Iniciar Chat'));
    expect(screen.getByText('Sin chats privados')).toBeInTheDocument();
  });

  it('renders empty state for no messages', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('soporte-staff'));
    expect(
      screen.getByText('Sé el primero en enviar un mensaje en este canal.'),
    ).toBeInTheDocument();
  });

  it('renders empty state for no direct messages', () => {
    render(<LauncherRelayChatView />);
    expect(screen.getByText('Sin chats privados')).toBeInTheDocument();
  });

  it('handles closing the add friend modal', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    expect(screen.getByPlaceholderText('Nickname de amigo...')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cerrar'));
    expect(screen.queryByPlaceholderText('Nickname de amigo...')).not.toBeInTheDocument();
  });

  it('handles invalid friend nickname', () => {
    render(<LauncherRelayChatView />);
    fireEvent.click(screen.getByText('Añadir'));
    const input = screen.getByPlaceholderText('Nickname de amigo...');
    fireEvent.change(input, { target: { value: 'a'.repeat(17) } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.queryByText('a'.repeat(17))).not.toBeInTheDocument();
  });

  it('handles invalid message input', () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Enviar mensaje a #global...');
    fireEvent.change(input, { target: { value: ' '.repeat(100) } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.queryByText(' '.repeat(100))).not.toBeInTheDocument();
  });

  it('handles invalid search input', () => {
    render(<LauncherRelayChatView />);
    const input = screen.getByPlaceholderText('Buscar canal o amigo...');
    fireEvent.change(input, { target: { value: ' '.repeat(100) } });
    expect(screen.getByText('global')).toBeInTheDocument();
  });
});
