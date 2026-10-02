// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  m: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LazyMotion: ({ children }: any) => <>{children}</>,
  domAnimation: {},
}));

vi.mock('lucide-react', () => ({
  X: vi.fn(),
  LogOut: vi.fn(),
  Settings: vi.fn(),
  Plus: vi.fn(),
}));

describe('AccountSwitcherModal', () => {
  let mockUseAuth: any;
  let mockGetSettings: any;
  let mockSaveSettings: any;
  let mockRemoveAccount: any;
  let mockLoginGuest: any;
  let mockSelectAccount: any;

  beforeEach(() => {
    mockUseAuth = useAuth as any;
    mockGetSettings = getSettings as any;
    mockSaveSettings = saveSettings as any;
    mockRemoveAccount = vi.fn();
    mockLoginGuest = vi.fn();
    mockSelectAccount = vi.fn();

    mockUseAuth.mockReturnValue({
      currentSession: { id: '1', username: 'testUser' },
      crystalSession: { username: 'crystalUser', email: 'crystal@example.com', role: 'admin', avatarUrl: 'https://example.com/avatar.png' },
      savedAccounts: [
        { id: '1', username: 'testUser', type: 'microsoft' },
        { id: '2', username: 'guestUser', type: 'guest' },
      ],
      selectAccount: mockSelectAccount,
      removeAccount: mockRemoveAccount,
      loginGuest: mockLoginGuest,
      logout: vi.fn(),
    });

    mockGetSettings.mockReturnValue({ avatarPreference: 'web' });
    mockSaveSettings.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal in modal mode by default', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    expect(screen.getAllByText(/Cuentas & Sesión/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Cuenta CrystalTides/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Perfiles de Minecraft/i)[0]).toBeInTheDocument();
  });

  it('renders the modal in inline mode', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} mode="inline" />);
    expect(screen.getAllByText(/Cuentas &.*Sesión/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Cuenta CrystalTides/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Perfiles de Minecraft/i)[0]).toBeInTheDocument();
  });

  it('toggles add offline account form', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButtons = screen.getAllByRole('button', { name: /Añadir Invitado/i });
    fireEvent.click(toggleButtons[0]);
    expect(screen.getAllByRole('button', { name: /Cancelar/i })[0]).toBeInTheDocument();
    fireEvent.click(toggleButtons[0]);
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
  });

  it('validates offline account nickname', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButtons = screen.getAllByRole('button', { name: /Añadir Invitado/i });
    fireEvent.click(toggleButtons[0]);
    const saveButtons = screen.getAllByRole('button', { name: /Guardar/i });
    fireEvent.click(saveButtons[0]);
    expect(screen.getByText(/Mínimo 3 caracteres/i)).toBeInTheDocument();
  });

  it('adds offline account successfully', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButtons = screen.getAllByRole('button', { name: /Añadir Invitado/i });
    fireEvent.click(toggleButtons[0]);
    const inputs = screen.getAllByPlaceholderText(/Nickname invitado.../i);
    fireEvent.change(inputs[0], { target: { value: 'validNick' } });
    const saveButtons = screen.getAllByRole('button', { name: /Guardar/i });
    fireEvent.click(saveButtons[0]);
    expect(mockLoginGuest).toHaveBeenCalledWith('validNick');
  });

  it('removes account', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const removeButtons = screen.getAllByTitle(/Quitar perfil/i);
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveAccount).toHaveBeenCalledWith('2');
  });
});
