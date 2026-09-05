import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { LauncherCrashModal } from './LauncherCrashModal';

vi.mock('@tauri-apps/api/core');

describe('LauncherCrashModal', () => {
  const mockInvoke = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnRelaunch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (invoke as any).mockImplementation(mockInvoke);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render nothing when isOpen is false', () => {
    render(<LauncherCrashModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should fetch diagnostic when isOpen is true', async () => {
    mockInvoke.mockResolvedValueOnce('/home/user');
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(2));
    expect(mockInvoke).toHaveBeenCalledWith('get_home_dir');
    expect(mockInvoke).toHaveBeenCalledWith('analyze_game_crash', { gameDir: '/home/user/.crystaltides', exitCode: 255 });
  });

  it('should handle null homeDir', async () => {
    mockInvoke.mockResolvedValueOnce(null);
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(2));
    expect(mockInvoke).toHaveBeenCalledWith('get_home_dir');
    expect(mockInvoke).toHaveBeenCalledWith('analyze_game_crash', { gameDir: '', exitCode: 255 });
  });

  it('should handle error in fetchDiagnostic', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Fetch Error'));

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(1));
    expect(mockInvoke).toHaveBeenCalledWith('get_home_dir');
  });

  it('should display default error message when diagnostic is null', () => {
    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('The internal server encountered an error while starting or updating game assets.')).toBeInTheDocument();
  });

  it('should display default suspected mod when diagnostic is null', () => {
    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)')).toBeInTheDocument();
  });

  it('should display diagnostic message when available', async () => {
    mockInvoke.mockResolvedValueOnce('/home/user');
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(screen.getByText('Test Reason')).toBeInTheDocument());
    expect(screen.getByText('Test Mod')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should relaunch game when relaunch button is clicked', () => {
    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} onRelaunch={mockOnRelaunch} />);
    fireEvent.click(screen.getByText('RELAUNCH GAME'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnRelaunch).toHaveBeenCalled();
  });

  it('should copy log when copy button is clicked', async () => {
    mockInvoke.mockResolvedValueOnce('/home/user');
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(screen.getByText('Copy Crash Log')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Copy Crash Log'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test Snippet');
    expect(screen.getByText('Log Copied to Clipboard!')).toBeInTheDocument();
  });

  it('should handle null diagnostic', () => {
    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('The internal server encountered an error while starting or updating game assets.')).toBeInTheDocument();
    expect(screen.getByText('Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)')).toBeInTheDocument();
  });

  it('should handle undefined gameDir', async () => {
    mockInvoke.mockResolvedValueOnce('/home/user');
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} />);
    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(2));
    expect(mockInvoke).toHaveBeenCalledWith('get_home_dir');
    expect(mockInvoke).toHaveBeenCalledWith('analyze_game_crash', { gameDir: '/home/user/.crystaltides', exitCode: 255 });
  });

  it('should handle empty gameDir', async () => {
    mockInvoke.mockResolvedValueOnce('/home/user');
    mockInvoke.mockResolvedValueOnce({
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    });

    render(<LauncherCrashModal isOpen={true} onClose={mockOnClose} gameDir="" />);
    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(2));
    expect(mockInvoke).toHaveBeenCalledWith('get_home_dir');
    expect(mockInvoke).toHaveBeenCalledWith('analyze_game_crash', { gameDir: '/home/user/.crystaltides', exitCode: 255 });
  });
});
