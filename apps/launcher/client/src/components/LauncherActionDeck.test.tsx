import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherActionDeck } from './LauncherActionDeck';
import { getProfiles, getProfile } from '../services/profileService';

vi.mock('../services/profileService', () => ({
  getProfiles: vi.fn(),
  getProfile: vi.fn(),
}));

describe('LauncherActionDeck', () => {
  let mockProfiles: Profile[];
  let mockActiveProfile: Profile;

  beforeEach(() => {
    mockProfiles = [
      { id: '1', name: 'Profile 1', loaderType: 'fabric', mcVersion: '1.21.1' },
      { id: '2', name: 'Profile 2', loaderType: 'forge', mcVersion: '1.21.1' },
    ];
    mockActiveProfile = mockProfiles[0];

    vi.mocked(getProfiles).mockReturnValue(mockProfiles);
    vi.mocked(getProfile).mockImplementation((id) => mockProfiles.find(p => p.id === id));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('LAUNCH')).toBeInTheDocument();
    expect(screen.getByText('LATEST PROFILES')).toBeInTheDocument();
    expect(screen.getByText('PARTNERS')).toBeInTheDocument();
  });

  it('renders the component with isDownloading true', () => {
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('DOWNLOADING')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders the component with isOffline true', () => {
    render(<LauncherActionDeck isOffline={true} onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('PLAY OFFLINE')).toBeInTheDocument();
  });

  it('calls onLaunch when the launch button is clicked', () => {
    const onLaunch = vi.fn();
    render(<LauncherActionDeck onLaunch={onLaunch} onSelectProfile={vi.fn()} />);
    fireEvent.click(screen.getByText('LAUNCH'));
    expect(onLaunch).toHaveBeenCalled();
  });

  it('does not call onLaunch when isDownloading is true', () => {
    const onLaunch = vi.fn();
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} onLaunch={onLaunch} onSelectProfile={vi.fn()} />);
    fireEvent.click(screen.getByText('DOWNLOADING'));
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it('calls onPauseDownload when the pause button is clicked', () => {
    const onPauseDownload = vi.fn();
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} onPauseDownload={onPauseDownload} onSelectProfile={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Pausar'));
    expect(onPauseDownload).toHaveBeenCalled();
  });

  it('calls onCancelDownload when the cancel button is clicked', () => {
    const onCancelDownload = vi.fn();
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} onCancelDownload={onCancelDownload} onSelectProfile={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Cancelar Descarga'));
    expect(onCancelDownload).toHaveBeenCalled();
  });

  it('renders the correct loader icon based on activeProfile loaderType', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('renders the correct loader name based on activeProfile loaderType', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('Fabric')).toBeInTheDocument();
  });

  it('calls onSelectProfile when a profile is clicked', () => {
    const onSelectProfile = vi.fn();
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={onSelectProfile} />);
    fireEvent.click(screen.getByText('Profile 1'));
    expect(onSelectProfile).toHaveBeenCalledWith('1');
  });

  it('renders the correct number of profiles', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: /profile/i }).length).toBe(2);
  });

  it('renders the correct number of partner badges', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: /partner/i }).length).toBe(8);
  });

  it('renders the component with selectedProfile', () => {
    render(<LauncherActionDeck selectedProfile="2" onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('Profile 2')).toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
  });

  it('renders the component with no selectedProfile', () => {
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('Profile 1')).toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
  });

  it('renders the component with empty profiles', () => {
    vi.mocked(getProfiles).mockReturnValue([]);
    render(<LauncherActionDeck onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.queryByText('Profile 1')).not.toBeInTheDocument();
  });

  it('renders the component with null selectedProfile', () => {
    render(<LauncherActionDeck selectedProfile={null} onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('Profile 1')).toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
  });

  it('renders the component with undefined selectedProfile', () => {
    render(<LauncherActionDeck selectedProfile={undefined} onLaunch={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByText('Profile 1')).toHaveStyle('border-color: rgba(45, 212, 191, 0.45)');
  });

  it('renders the component with isPaused true', () => {
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} isPaused={true} onPauseDownload={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByTitle('Reanudar')).toBeInTheDocument();
  });

  it('renders the component with isPaused false', () => {
    render(<LauncherActionDeck isDownloading={true} downloadProgress={50} isPaused={false} onPauseDownload={vi.fn()} onSelectProfile={vi.fn()} />);
    expect(screen.getByTitle('Pausar')).toBeInTheDocument();
  });

  it('calls onChangeVersion when the change version button is clicked', () => {
    const onChangeVersion = vi.fn();
    render(<LauncherActionDeck onChangeVersion={onChangeVersion} onSelectProfile={vi.fn()} />);
    fireEvent.click(screen.getByText('CHANGE VERSION'));
    expect(onChangeVersion).toHaveBeenCalled();
  });
});
