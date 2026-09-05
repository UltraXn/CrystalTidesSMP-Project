import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LauncherActionDeck } from '../LauncherActionDeck';
import { getProfiles, getProfile } from "../services/profileService";

vi.mock('../services/profileService', () => ({
  getProfiles: vi.fn(),
  getProfile: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  m: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LazyMotion: ({ children }: any) => <>{children}</>,
  domAnimation: {},
}));

describe('LauncherActionDeck', () => {
  const mockProfiles = [
    { id: '1', name: 'Profile 1', loaderType: 'fabric', mcVersion: '1.21.1' },
    { id: '2', name: 'Profile 2', loaderType: 'forge', mcVersion: '1.21.1' },
  ];

  beforeEach(() => {
    vi.mocked(getProfiles).mockReturnValue(mockProfiles);
    vi.mocked(getProfile).mockImplementation((id) => mockProfiles.find(p => p.id === id));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('LAUNCH')).toBeInTheDocument();
  });

  it('renders the component with isDownloading true', () => {
    render(<LauncherActionDeck
      isDownloading={true}
      downloadProgress={50}
      onPauseDownload={() => {}}
      onCancelDownload={() => {}}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('DOWNLOADING')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders the component with isOffline true', () => {
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      isOffline={true}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('PLAY OFFLINE')).toBeInTheDocument();
  });

  it('calls onLaunch when launch button is clicked', async () => {
    const onLaunch = vi.fn();
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={onLaunch}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    await userEvent.click(screen.getByText('LAUNCH'));
    expect(onLaunch).toHaveBeenCalled();
  });

  it('calls onPauseDownload when pause button is clicked', async () => {
    const onPauseDownload = vi.fn();
    render(<LauncherActionDeck
      isDownloading={true}
      downloadProgress={50}
      onPauseDownload={onPauseDownload}
      onCancelDownload={() => {}}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    await userEvent.click(screen.getByTitle('Pausar'));
    expect(onPauseDownload).toHaveBeenCalled();
  });

  it('calls onCancelDownload when cancel button is clicked', async () => {
    const onCancelDownload = vi.fn();
    render(<LauncherActionDeck
      isDownloading={true}
      downloadProgress={50}
      onPauseDownload={() => {}}
      onCancelDownload={onCancelDownload}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    await userEvent.click(screen.getByTitle('Cancelar Descarga'));
    expect(onCancelDownload).toHaveBeenCalled();
  });

  it('calls onSelectProfile when profile is clicked', async () => {
    const onSelectProfile = vi.fn();
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={onSelectProfile}
    />);
    await userEvent.click(screen.getByText('Profile 2'));
    expect(onSelectProfile).toHaveBeenCalledWith('2');
  });

  it('calls onChangeVersion when change version button is clicked', async () => {
    const onChangeVersion = vi.fn();
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
      onChangeVersion={onChangeVersion}
    />);
    await userEvent.click(screen.getByText('CHANGE VERSION'));
    expect(onChangeVersion).toHaveBeenCalled();
  });

  it('renders the correct loader icon and name', () => {
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={() => {}}
      selectedProfile="2"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('Forge')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Forge' })).toBeInTheDocument();
  });

  it('renders the correct profile selection', () => {
    render(<LauncherActionDeck
      isDownloading={false}
      downloadProgress={0}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('Profile 1')).toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
    expect(screen.getByText('Profile 2')).not.toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
  });

  it('renders the correct downloading banner', () => {
    render(<LauncherActionDeck
      isDownloading={true}
      downloadProgress={50}
      currentAsset="Downloading asset..."
      onPauseDownload={() => {}}
      onCancelDownload={() => {}}
      onLaunch={() => {}}
      selectedProfile="1"
      onSelectProfile={() => {}}
    />);
    expect(screen.getByText('Downloading asset...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
