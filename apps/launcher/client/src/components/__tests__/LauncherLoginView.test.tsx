// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LauncherLoginView } from '../LauncherLoginView';

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    startDragging: vi.fn().mockRejectedValue(new Error('Tauri not running')),
    minimize: vi.fn().mockRejectedValue(new Error('Tauri not running')),
    toggleMaximize: vi.fn().mockRejectedValue(new Error('Tauri not running')),
    close: vi.fn().mockRejectedValue(new Error('Tauri not running')),
  })),
}));

vi.mock('../LauncherLegalModal', () => ({
  LauncherLegalModal: vi.fn(({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>Legal Modal</div> : null)),
}));

describe('LauncherLoginView', () => {
  let onLoginMicrosoft: Mock;
  let onViewGithub: Mock;
  let onContinueAsGuest: Mock;
  let onMinimize: Mock;
  let onMaximize: Mock;
  let onClose: Mock;
  let onStartDrag: Mock;

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
    await user.click(screen.getByRole('button', { name: /iniciar como invitado/i }));
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'GuestUser');
    await user.click(submitButton);

    expect(onContinueAsGuest).toHaveBeenCalledWith('GuestUser');
  });

  it('should show error for guest username with less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    await user.click(screen.getByRole('button', { name: /iniciar como invitado/i }));
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    await user.type(input, 'A');
    await user.click(submitButton);

    expect(screen.getByText(/el nombre debe tener entre 3 y 16 caracteres/i)).toBeInTheDocument();
  });

  it('should show error for guest username with more than 16 characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    await user.click(screen.getByRole('button', { name: /iniciar como invitado/i }));
    const input = screen.getByRole('textbox', { name: /nickname/i });
    const submitButton = screen.getByRole('button', { name: /entrar como invitado/i });

    fireEvent.change(input, { target: { value: 'A'.repeat(17) } });
    await user.click(submitButton);

    expect(screen.getByText(/el nombre debe tener entre 3 y 16 caracteres/i)).toBeInTheDocument();
  });

  it('should show error for guest username with invalid characters', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView onContinueAsGuest={onContinueAsGuest} />);
    await user.click(screen.getByRole('button', { name: /iniciar como invitado/i }));
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
    const { container } = render(<LauncherLoginView onStartDrag={onStartDrag} />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    fireEvent.mouseDown(header!, { button: 0 });
    // handleStartDrag is async due to dynamic import
    await vi.waitFor(() => {
      expect(onStartDrag).toHaveBeenCalled();
    });
  });

  it('should switch to guest mode and back to microsoft mode', async () => {
    const user = userEvent.setup();
    render(<LauncherLoginView />);
    const guestButton = screen.getByRole('button', { name: /iniciar como invitado/i });
    await user.click(guestButton);
    expect(screen.getByRole('textbox', { name: /nickname/i })).toBeInTheDocument();

    const backToMicrosoftButton = screen.getByRole('button', {
      name: /volver a inicio con microsoft/i,
    });
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
