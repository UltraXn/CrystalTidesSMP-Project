import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherCrashModal from '../LauncherCrashModal';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LauncherCrashModal', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<LauncherCrashModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should fetch diagnostic when isOpen is true', async () => {
    const mockDiagnostic = {
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    };

    (invoke as any).mockResolvedValueOnce('/home/user');
    (invoke as any).mockResolvedValueOnce(mockDiagnostic);

    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Test Reason')).toBeInTheDocument();
    });
  });

  it('should render default error message when diagnostic is null', () => {
    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('The internal server encountered an error while starting or updating game assets.')).toBeInTheDocument();
  });

  it('should render default suspected mod when diagnostic is null', () => {
    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<LauncherCrashModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onRelaunch when relaunch button is clicked', async () => {
    const onRelaunch = vi.fn();
    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} onRelaunch={onRelaunch} />);
    await user.click(screen.getByRole('button', { name: /relaunch game/i }));
    expect(onRelaunch).toHaveBeenCalled();
  });

  it('should copy log to clipboard when copy button is clicked', async () => {
    const mockDiagnostic = {
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    };

    (invoke as any).mockResolvedValueOnce('/home/user');
    (invoke as any).mockResolvedValueOnce(mockDiagnostic);

    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Test Reason')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /copy crash log/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test Snippet');
    expect(screen.getByText('Log Copied to Clipboard!')).toBeInTheDocument();
  });

  it('should handle copied state correctly', async () => {
    const mockDiagnostic = {
      exit_code: 1,
      primary_cause: 'Test Cause',
      detailed_reason: 'Test Reason',
      offending_mod: 'Test Mod',
      recommended_action: 'Test Action',
      raw_snippet: 'Test Snippet',
      timestamp: new Date().toISOString(),
    };

    (invoke as any).mockResolvedValueOnce('/home/user');
    (invoke as any).mockResolvedValueOnce(mockDiagnostic);

    render(<LauncherCrashModal isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Test Reason')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /copy crash log/i }));
    expect(screen.getByText('Log Copied to Clipboard!')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Copy Crash Log')).toBeInTheDocument();
    });
  });
});
