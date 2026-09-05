import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AccountSwitcherModal } from '../AccountSwitcherModal';
import { useAuth } from '../services/authContext';
import { getSettings, saveSettings } from '../services/settingsService';

vi.mock('../services/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/settingsService', () => ({
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

  beforeEach(() => {
    mockUseAuth = useAuth as any;
    mockGetSettings = getSettings as any;
    mockSaveSettings = saveSettings as any;

    mockUseAuth.mockReturnValue({
      currentSession: { id: '1', username: 'testUser' },
      crystalSession: { username: 'crystalUser', email: 'crystal@example.com', role: 'admin', avatarUrl: 'https://example.com/avatar.png' },
      savedAccounts: [
        { id: '1', username: 'testUser', type: 'microsoft' },
        { id: '2', username: 'guestUser', type: 'guest' },
      ],
      selectAccount: vi.fn(),
      removeAccount: vi.fn(),
      loginGuest: vi.fn(),
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
    expect(screen.getByText('Cuentas &amp; Sesión')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides Account')).toBeInTheDocument();
    expect(screen.getByText('Perfiles de Minecraft')).toBeInTheDocument();
  });

  it('renders the modal in inline mode', () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} mode="inline" />);
    expect(screen.getByText('Cuentas &amp; Sesión')).toBeInTheDocument();
    expect(screen.getByText('CrystalTides Account')).toBeInTheDocument();
    expect(screen.getByText('Perfiles de Minecraft')).toBeInTheDocument();
  });

  it('toggles add offline account form', async () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButton = screen.getByRole('button', { name: 'Añadir Invitado' });
    await toggleButton.click();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    await toggleButton.click();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('validates offline account nickname', async () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButton = screen.getByRole('button', { name: 'Añadir Invitado' });
    await toggleButton.click();
    const input = screen.getByRole('textbox');
    await input.focus();
    await input.blur();
    expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
  });

  it('adds offline account successfully', async () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings={vi.fn()} />);
    const toggleButton = screen.getByRole('button', { name: 'Añadir Invitado' });
    await toggleButton.click();
    const input = screen.getByRole('textbox');
    await input.focus();
    await input.type('validNick');
    const saveButton = screen.getByRole('button', { name: 'Guardar' });
    await saveButton.click();
    expect(mockUseAuth().loginGuest).toHaveBeenCalledWith('validNick');
    expect(mockUseAuth().selectAccount).toHaveBeenCalledWith('1');
    expect(mockUseAuth().onClose).toHaveBeenCalled();
  });

  it('removes account', async () => {
    render(<AccountSwitcherModal onClose={vi.fn()} onNavigateSettings
