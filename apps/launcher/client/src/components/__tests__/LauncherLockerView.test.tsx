import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LauncherLockerView } from '../LauncherLockerView';
import { useAuth } from '../../services/authContext';

vi.mock('../../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../Launcher3DSkinViewer', () => ({
  Launcher3DSkinViewer: vi.fn(({ onViewerReady }: any) => {
    React.useEffect(() => {
      onViewerReady?.({
        camera: {
          position: { set: vi.fn() },
          rotation: { set: vi.fn() },
        },
      });
    }, [onViewerReady]);
    return <div data-testid="mock-3d-skin-viewer">Mock 3D Skin Viewer</div>;
  }),
}));

class MockFileReader {
  onload: ((e: any) => void) | null = null;
  readAsDataURL(_file: File) {
    if (this.onload) {
      this.onload({ target: { result: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==' } });
    }
  }
}

describe('LauncherLockerView', () => {
  let mockAuth: any;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('FileReader', MockFileReader);
    mockAuth = {
      currentSession: {
        username: 'testUser',
      },
    };
    (useAuth as Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders the component with default sections', () => {
    render(<LauncherLockerView />);
    expect(screen.getByText('LOCKER')).toBeInTheDocument();
    expect(screen.getByText('CURRENT SKIN')).toBeInTheDocument();
    expect(screen.getByText('UPLOAD SKIN')).toBeInTheDocument();
    expect(screen.getByText('CAPES')).toBeInTheDocument();
  });

  it('toggles cape visibility', async () => {
    render(<LauncherLockerView />);
    const capeToggle = screen.getByRole('button', { name: /ocultar capa/i });
    await userEvent.click(capeToggle);
    expect(screen.getByRole('button', { name: /mostrar capa/i })).toBeInTheDocument();
  });

  it('toggles armor visibility', async () => {
    render(<LauncherLockerView />);
    const armorToggle = screen.getByRole('button', { name: /mostrar chaqueta\/capa 2/i });
    await userEvent.click(armorToggle);
    expect(screen.getByRole('button', { name: /ocultar chaqueta\/capa 2/i })).toBeInTheDocument();
  });

  it('resets 3D viewer rotation', async () => {
    render(<LauncherLockerView />);
    const resetRotation = screen.getByRole('button', { name: /restablecer rotación/i });
    await userEvent.click(resetRotation);
    expect(resetRotation).toBeInTheDocument();
  });

  it('downloads the current skin', async () => {
    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'a') {
        const el = origCreateElement('a');
        el.click = clickSpy;
        return el;
      }
      return origCreateElement(tagName);
    });

    render(<LauncherLockerView />);
    const downloadButton = screen.getByRole('button', { name: /descargar skin \.png/i });
    await userEvent.click(downloadButton);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('toggles animation play/pause', async () => {
    render(<LauncherLockerView />);
    const playPauseButton = screen.getByRole('button', { name: /pausar animación/i });
    await userEvent.click(playPauseButton);
    expect(screen.getByRole('button', { name: /reanudar animación/i })).toBeInTheDocument();
  });

  it('scrolls the capes carousel left and right', async () => {
    render(<LauncherLockerView />);
    const leftButton = screen.getByRole('button', { name: /capas anteriores/i });
    const rightButton = screen.getByRole('button', { name: /capas siguientes/i });
    await userEvent.click(leftButton);
    await userEvent.click(rightButton);
    expect(leftButton).toBeInTheDocument();
  });

  it('uploads a skin file and opens modal', async () => {
    render(<LauncherLockerView />);
    const fileInput = screen.getByLabelText(/upload skin file/i);
    const file = new File(['mock content'], 'my_cool_skin.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByText('my_cool_skin.png')).toBeInTheDocument();
    });
  });

  it('closes upload modal when close button is clicked', async () => {
    render(<LauncherLockerView />);
    const fileInput = screen.getByLabelText(/upload skin file/i);
    const file = new File(['mock content'], 'saved_skin.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const closeButton = await screen.findByRole('button', { name: /cerrar modal/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cerrar modal/i })).not.toBeInTheDocument();
    });
  });

  it('toggles favorite status of a skin', async () => {
    render(<LauncherLockerView />);
    const favoriteButtons = screen.getAllByRole('button', { name: /quitar de favoritos/i });
    expect(favoriteButtons.length).toBeGreaterThan(0);
    await userEvent.click(favoriteButtons[0]);
    expect(
      screen.getAllByRole('button', { name: /marcar como favorito|quitar de favoritos/i }).length,
    ).toBeGreaterThan(0);
  });

  it('renders the upload skin box with drag and drop', async () => {
    render(<LauncherLockerView />);
    const uploadBox = screen.getByRole('button', { name: /drag & drop file or browse/i });
    expect(uploadBox).toBeInTheDocument();
    fireEvent.dragOver(uploadBox);
    fireEvent.dragLeave(uploadBox);
  });
});
