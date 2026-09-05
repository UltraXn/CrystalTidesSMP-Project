import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherLoginView from '../LauncherLoginView';

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    startDragging: vi.fn(),
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock('../LauncherLegalModal', () => ({
  LauncherLegalModal: vi.fn(() => <div>Legal Modal</div>),
}));

describe('LauncherLoginView', () => {
  let onLoginMicrosoft: jest.Mock;
  let onViewGithub: jest.Mock;
  let onContinueAsGuest: jest.Mock;
  let onMinimize: jest.Mock;
  let onMaximize: jest.Mock;
  let onClose: jest.Mock;
  let onStartDrag: jest.Mock;

  beforeEach(() => {
    onLoginMicrosoft = vi.fn();
    onViewGithub = vi.fn();
    onContinueAsGuest = vi.fn();
    onMinimize = vi.fn();
    onMaximize = vi.fn();
    onClose = vi.fn();
    onStartDrag = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with default state', () => {
    render(<LauncherLoginView />);
    expect(screen.getByRole('heading', { name: /crystal client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in with microsoft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar como invitado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view code/i })).toBeInTheDocument();
  });

  it('should call onLoginMicrosoft when Microsoft button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onLoginMicrosoft={onLoginMicrosoft} />);
    const button = screen.getByRole('button', { name: /log in with microsoft/i });
    await user.click(button);
    expect(onLoginMicrosoft).toHaveBeenCalled();
  });

  it('should call onViewGithub when GitHub button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onViewGithub={onViewGithub} />);
    const button = screen.getByRole('button', { name: /view code/i });
    await user.click(button);
    expect(onViewGithub).toHaveBeenCalled();
  });

  it('should call onContinueAsGuest with valid guest username', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'GuestUser');
    await user.click(submitButton);

    expect(onContinueAsGuest).toHaveBeenCalledWith('GuestUser');
  });

  it('should show error for guest username with less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'A');
    await user.click(submitButton);

    expect(screen.getByText(/el nombre debe tener entre 3 y 16 caracteres/i)).toBeInTheDocument();
  });

  it('should show error for guest username with more than 16 characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'A'.repeat(17));
    await user.click(submitButton);

    expect(screen.getByText(/el nombre debe tener entre 3 y 16 caracteres/i)).toBeInTheDocument();
  });

  it('should show error for guest username with invalid characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'Guest_User!');
    await user.click(submitButton);

    expect(screen.getByText(/solo letras, números y guiones bajos/i)).toBeInTheDocument();
  });

  it('should call onMinimize when Minimize button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onMinimize={onMinimize} />);
    const button = screen.getByRole('button', { name: /minimize/i });
    await user.click(button);
    expect(onMinimize).toHaveBeenCalled();
  });

  it('should call onMaximize when Maximize button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onMaximize={onMaximize} />);
    const button = screen.getByRole('button', { name: /maximize/i });
    await user.click(button);
    expect(onMaximize).toHaveBeenCalled();
  });

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onClose={onClose} />);
    const button = screen.getByRole('button', { name: /close/i });
    await user.click(button);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onStartDrag when header is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onStartDrag={onStartDrag} />);
    const header = screen.getByRole('button', { name: /crystal client/i });
    await user.pointer({ target: header, keys: '[MouseLeft]' });
    expect(onStartDrag).toHaveBeenCalled();
  });

  it('should switch to guest mode and back to microsoft mode', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView />);
    const guestButton = screen.getByRole('button', { name: /iniciar como invitado/i });
    await user.click(guestButton);
    expect(screen.getByRole('textbox', { name: /nickname/i })).toBeInTheDocument();

    const backToMicrosoftButton = screen.getByRole('button', { name: /volver a inicio con microsoft/i });
    await user.click(backToMicrosoftButton);
    expect(screen.getByRole('button', { name: /log in with microsoft/i })).toBeInTheDocument();
  });

  it('should open legal modal when Privacy Policy is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView />);
    const privacyPolicyLink = screen.getByText(/privacy policy/i);
    await user.click(privacyPolicyLink);
    expect(screen.getByText(/legal modal/i)).toBeInTheDocument();
  });

  it('should open legal modal when Terms of Service is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView />);
    const tosLink = screen.getByText(/terms of service/i);
    await user.click(tosLink);
    expect(screen.getByText(/legal modal/i)).toBeInTheDocument();
  });

  it('should open legal modal when Support is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView />);
    const supportLink = screen.getByText(/support/i);
    await user.click(supportLink);
    expect(screen.getByText(/legal modal/i)).toBeInTheDocument();
  });
});
