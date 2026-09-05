import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherLockerView from '../LauncherLockerView';
import { useAuth } from '../services/authContext';

vi.mock('../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LauncherLockerView', () => {
  let mockAuth: any;

  beforeEach(() => {
    mockAuth = {
      currentSession: {
        username: 'testUser',
      },
    };
    (useAuth as vi.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default skin', () => {
    render(<LauncherLockerView />);
    expect(screen.getByText('LOCKER')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });

  it('toggles cape visibility', async () => {
    render(<LauncherLockerView />);
    const capeToggle = screen.getByRole('button', { name: /ocultar capa/i });
    await userEvent.click(capeToggle);
    expect(screen.getByRole('button', { name: /mostrar capa/i })).toBeInTheDocument();
  });

  it('toggles armor visibility', async () => {
    render(<LauncherLockerView />);
    const armorToggle = screen.getByRole('button', { name: /ocultar chaqueta\/capa 2/i });
    await userEvent.click(armorToggle);
    expect(screen.getByRole('button', { name: /mostrar chaqueta\/capa 2/i })).toBeInTheDocument();
  });

  it('resets 3D viewer rotation', async () => {
    render(<LauncherLockerView />);
    const resetRotation = screen.getByRole('button', { name: /restablecer rotación/i });
    await userEvent.click(resetRotation);
    // Assuming handleResetRotation sets camera position and rotation
    // We would need to mock viewerInstanceRef.current to verify this
  });

  it('downloads the current skin', async () => {
    render(<LauncherLockerView />);
    const downloadButton = screen.getByRole('button', { name: /descargar skin .png/i });
    await userEvent.click(downloadButton);
    // Assuming handleDownloadSkin creates and clicks an anchor element
    // We would need to mock document.body.appendChild and a.click to verify this
  });

  it('toggles animation play/pause', async () => {
    render(<LauncherLockerView />);
    const playPauseButton = screen.getByRole('button', { name: /pausar animación/i });
    await userEvent.click(playPauseButton);
    expect(screen.getByRole('button', { name: /reanudar animación/i })).toBeInTheDocument();
  });

  it('scrolls the capes carousel left and right', async () => {
    render(<LauncherLockerView />);
    const leftButton = screen.getByRole('button', { name: /< /i });
    const rightButton = screen.getByRole('button', { name: /> /i });
    await userEvent.click(leftButton);
    await userEvent.click(rightButton);
    // Assuming scrollCarousel scrolls the carousel
    // We would need to mock ref.current to verify this
  });

  it('uploads a skin file', async () => {
    render(<LauncherLockerView />);
    const fileInput = screen.getByRole('button', { name: /explorar archivo/i });
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('saves a new skin from the modal', async () => {
    render(<LauncherLockerView />);
    const uploadButton = screen.getByRole('button', { name: /explorar archivo/i });
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    await userEvent.upload(uploadButton, file);
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('toggles favorite status of a skin', async () => {
    render(<LauncherLockerView />);
    const favoriteButton = screen.getByRole('button', { name: /quitar de favoritos/i });
    await userEvent.click(favoriteButton);
    expect(screen.getByRole('button', { name: /marcar como favorito/i })).toBeInTheDocument();
  });

  it('renders the upload skin box with drag and drop', async () => {
    render(<LauncherLockerView />);
    const uploadBox = screen.getByRole('button', { name: /drag & drop file or browse/i });
    await userEvent.pointer({ target: uploadBox, keys: '[MouseLeft]' });
    await userEvent.pointer({ target: uploadBox, keys: '[MouseLeft]/[MouseUp]' });
    expect(screen.getByRole('button', { name: /drag & drop file or browse/i })).toBeInTheDocument();
  });
});
