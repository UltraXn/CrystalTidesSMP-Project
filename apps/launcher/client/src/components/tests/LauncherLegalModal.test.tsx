import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherLegalModal from '../LauncherLegalModal';

describe('LauncherLegalModal', () => {
  let onCloseMock: () => void;

  beforeEach(() => {
    onCloseMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<LauncherLegalModal isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close the modal when the close button is clicked', async () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should not close the modal when clicking inside the modal content', async () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    const modalContent = screen.getByRole('dialog');
    await userEvent.click(modalContent);
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('should render the correct initial tab content', () => {
    render(<LauncherLegalModal isOpen={true} initialTab="tos" onClose={onCloseMock} />);
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/help & community channels/i)).not.toBeInTheDocument();
  });

  it('should switch to Privacy Policy tab when button is clicked', async () => {
    render(<LauncherLegalModal isOpen={true} initialTab="tos" onClose={onCloseMock} />);
    const privacyButton = screen.getByRole('button', { name: /privacy policy/i });
    await userEvent.click(privacyButton);
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/terms of service/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/help & community channels/i)).not.toBeInTheDocument();
  });

  it('should switch to Help & Support tab when button is clicked', async () => {
    render(<LauncherLegalModal isOpen={true} initialTab="tos" onClose={onCloseMock} />);
    const supportButton = screen.getByRole('button', { name: /help & support/i });
    await userEvent.click(supportButton);
    expect(screen.getByText(/help & community channels/i)).toBeInTheDocument();
    expect(screen.queryByText(/terms of service/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
  });

  it('should render the correct content for each tab', () => {
    render(<LauncherLegalModal isOpen={true} initialTab="tos" onClose={onCloseMock} />);
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/help & community channels/i)).not.toBeInTheDocument();

    render(<LauncherLegalModal isOpen={true} initialTab="privacy" onClose={onCloseMock} />);
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/terms of service/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/help & community channels/i)).not.toBeInTheDocument();

    render(<LauncherLegalModal isOpen={true} initialTab="support" onClose={onCloseMock} />);
    expect(screen.getByText(/help & community channels/i)).toBeInTheDocument();
    expect(screen.queryByText(/terms of service/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
  });

  it('should render the Discord and GitHub cards in Help & Support tab', () => {
    render(<LauncherLegalModal isOpen={true} initialTab="support" onClose={onCloseMock} />);
    expect(screen.getByText(/discord community/i)).toBeInTheDocument();
    expect(screen.getByText(/github issue tracker/i)).toBeInTheDocument();
  });

  it('should open the Discord link in a new tab', async () => {
    render(<LauncherLegalModal isOpen={true} initialTab="support" onClose={onCloseMock} />);
    const discordLink = screen.getByRole('link', { name: /discord community/i });
    await userEvent.click(discordLink);
    expect(window.open).toHaveBeenCalledWith('https://discord.gg', '_blank');
  });

  it('should open the GitHub link in a new tab', async () => {
    render(<LauncherLegalModal isOpen={true} initialTab="support" onClose={onCloseMock} />);
    const githubLink = screen.getByRole('link', { name: /github issue tracker/i });
    await userEvent.click(githubLink);
    expect(window.open).toHaveBeenCalledWith('https://github.com/UltraXn/CrystalTidesSMP-Project/issues', '_blank');
  });
});
