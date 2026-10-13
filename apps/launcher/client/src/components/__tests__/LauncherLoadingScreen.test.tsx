import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LauncherLoadingScreen } from '../LauncherLoadingScreen';

const mockStartDragging = vi.fn().mockResolvedValue(undefined);

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    startDragging: mockStartDragging,
  })),
}));

describe('LauncherLoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the initial phase correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(
      screen.getByText(/Iniciando módulos principales de Crystal Client.../i),
    ).toBeInTheDocument();
  });

  it('should update phase text every 900ms', () => {
    render(<LauncherLoadingScreen />);
    expect(
      screen.getByText(/Iniciando módulos principales de Crystal Client.../i),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(
      screen.getByText(/Verificando entorno seguro y almacenamiento local.../i),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText(/Sincronizando perfiles y configuraciones.../i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText(/Cargando experiencia de juego.../i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(
      screen.getByText(/Iniciando módulos principales de Crystal Client.../i),
    ).toBeInTheDocument();
  });

  it('should handle mouse down event on header', async () => {
    render(<LauncherLoadingScreen />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();

    await act(async () => {
      fireEvent.mouseDown(header!, { button: 0 });
    });

    expect(mockStartDragging).toHaveBeenCalled();
  });

  it('should handle mouse down event on header when Tauri fails gracefully', async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    vi.mocked(getCurrentWindow).mockImplementationOnce(() => {
      throw new Error('Not in Tauri');
    });

    render(<LauncherLoadingScreen />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();

    await act(async () => {
      expect(() => {
        fireEvent.mouseDown(header!, { button: 0 });
      }).not.toThrow();
    });
  });

  it('should render the mascot avatar correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByAltText(/Crystal Mascot/i)).toBeInTheDocument();
  });

  it('should render the brand name correctly', () => {
    render(<LauncherLoadingScreen />);
    expect(screen.getByRole('heading', { name: /Crystal Client/i })).toBeInTheDocument();
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
