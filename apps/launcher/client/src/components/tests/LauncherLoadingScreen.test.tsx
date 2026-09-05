import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherLoadingScreen from '../LauncherLoadingScreen';

describe('LauncherLoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the initial phase correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByText(/Iniciando módulos principales de Crystal Client.../i)).toBeInTheDocument();
  });

  it('should update phase text every 900ms', async () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByText(/Iniciando módulos principales de Crystal Client.../i)).toBeInTheDocument();

    vi.advanceTimersByTime(900);
    await waitFor(() => {
      expect(screen.getByText(/Verificando entorno seguro y almacenamiento local.../i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(900);
    await waitFor(() => {
      expect(screen.getByText(/Sincronizando perfiles y configuraciones.../i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(900);
    await waitFor(() => {
      expect(screen.getByText(/Cargando experiencia de juego.../i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(900);
    await waitFor(() => {
      expect(screen.getByText(/Iniciando módulos principales de Crystal Client.../i)).toBeInTheDocument();
    });
  });

  it('should handle mouse down event on header', async () => {
    const user = userEvent.setup();
    const mockGetCurrentWindow = vi.fn().mockResolvedValue({ startDragging: vi.fn() });
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: mockGetCurrentWindow,
    }));

    render(<LauncherLoadingScreen />);
    const header = screen.getByRole('heading', { name: /Crystal Client/i });
    await user.pointer({ target: header, keys: '[MouseLeft]' });

    expect(mockGetCurrentWindow).toHaveBeenCalled();
    expect(mockGetCurrentWindow().startDragging).toHaveBeenCalled();
  });

  it('should handle mouse down event on header without Tauri', async () => {
    const user = userEvent.setup();
    vi.mock('@tauri-apps/api/window', () => ({
      getCurrentWindow: vi.fn().mockRejectedValue(new Error('Not in Tauri')),
    }));

    render(<LauncherLoadingScreen />);
    const header = screen.getByRole('heading', { name: /Crystal Client/i });
    await user.pointer({ target: header, keys: '[MouseLeft]' });

    expect(vi.mocked(getCurrentWindow)).toHaveBeenCalled();
  });

  it('should render the mascot avatar correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByAltText(/Crystal Mascot/i)).toBeInTheDocument();
  });

  it('should render the brand name correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByText(/Crystal Client/i)).toBeInTheDocument();
  });

  it('should render the progress bar correctly', () => {
    render(<LauncherLoadingScreen />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render the bottom tag correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByText(/Build 0.9.2/i)).toBeInTheDocument();
  });
});
