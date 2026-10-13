import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountSwitcherModal } from '../AccountSwitcherModal';
import { useAuth } from '../../services/authContext';
import { getSettings, saveSettings } from '../../services/settingsService';

vi.mock('../../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/settingsService', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

describe('AccountSwitcherModal', () => {
  const mockOnClose = vi.fn();
  const mockOnNavigateSettings = vi.fn();
  const mockCurrentSession = { id: '1', username: 'user1' };
  const mockCrystalSession = {
    username: 'crystalUser',
    email: 'crystal@example.com',
    role: 'admin',
    avatarUrl: 'avatar.png',
  };
  const mockSavedAccounts = [
    { id: '1', username: 'user1', type: 'microsoft' as const },
    { id: '2', username: 'user2', type: 'guest' as const },
  ];

  let mockSelectAccount = vi.fn();
  let mockRemoveAccount = vi.fn();
  let mockLoginGuest = vi.fn();
  let mockLogout = vi.fn();

  beforeEach(() => {
    mockSelectAccount = vi.fn();
    mockRemoveAccount = vi.fn();
    mockLoginGuest = vi.fn().mockResolvedValue(undefined);
    mockLogout = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuth).mockReturnValue({
      currentSession: mockCurrentSession,
      crystalSession: mockCrystalSession,
      savedAccounts: mockSavedAccounts,
      selectAccount: mockSelectAccount,
      removeAccount: mockRemoveAccount,
      loginGuest: mockLoginGuest,
      logout: mockLogout,
    });

    vi.mocked(getSettings).mockReturnValue({ avatarPreference: 'web' });
    vi.mocked(saveSettings).mockImplementation(() => Promise.resolve());
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal in "modal" mode', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    expect(screen.getByText(/Cuentas &.*Sesión/i)).toBeInTheDocument();
    expect(screen.getByText('Cuenta CrystalTides')).toBeInTheDocument();
    expect(screen.getByText('Perfiles de Minecraft')).toBeInTheDocument();
  });

  it('renders the modal in "inline" mode', () => {
    render(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
        mode="inline"
      />,
    );
    expect(screen.getByText(/Cuentas &.*Sesión/i)).toBeInTheDocument();
    expect(screen.getByText('Cuenta CrystalTides')).toBeInTheDocument();
    expect(screen.getByText('Perfiles de Minecraft')).toBeInTheDocument();
  });

  it('closes the modal when backdrop is clicked', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('toggles add offline account input', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Añadir Invitado'));
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.getByText('Añadir Invitado')).toBeInTheDocument();
  });

  it('adds a new offline account', async () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Añadir Invitado'));
    fireEvent.change(screen.getByPlaceholderText('Nickname invitado...'), {
      target: { value: 'newUser' },
    });
    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockLoginGuest).toHaveBeenCalledWith('newUser');
    });
  });

  it('displays error when adding invalid offline account', async () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Añadir Invitado'));
    fireEvent.change(screen.getByPlaceholderText('Nickname invitado...'), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => {
      expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
    });
  });

  it('selects an account', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('user2'));
    expect(mockSelectAccount).toHaveBeenCalledWith('2');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('removes an account', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByTitle('Quitar perfil'));
    expect(mockRemoveAccount).toHaveBeenCalledWith('2');
  });

  it('toggles avatar preference', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Minecraft'));
    expect(vi.mocked(saveSettings)).toHaveBeenCalledWith({ avatarPreference: 'minecraft' });
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('logs out when "Cerrar Sesión" is clicked', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('navigates to settings when "Ajustes" is clicked', () => {
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    fireEvent.click(screen.getByText('Ajustes'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnNavigateSettings).toHaveBeenCalled();
  });

  it('handles missing saved accounts', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      savedAccounts: [],
    });
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    expect(screen.getByText('Sin cuentas guardadas')).toBeInTheDocument();
  });

  it('handles missing crystal session', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      crystalSession: null,
    });
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    expect(screen.getByText('Sin sincronizar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Vincular'));
    expect(mockOnNavigateSettings).toHaveBeenCalled();
  });

  it('handles missing current session', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      currentSession: null,
    });
    render(
      <AccountSwitcherModal onClose={mockOnClose} onNavigateSettings={mockOnNavigateSettings} />,
    );
    expect(screen.queryByText('Activo')).not.toBeInTheDocument();
  });
});
