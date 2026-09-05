import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherLegalModal } from './LauncherLegalModal';

describe('LauncherLegalModal', () => {
  let onCloseMock: vi.Mock;

  beforeEach(() => {
    onCloseMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when isOpen is false', () => {
    render(<LauncherLegalModal isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the modal when isOpen is true', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should call onClose when clicking outside the modal', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should not call onClose when clicking inside the modal', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('Legal & Policies'));
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('should render the "Terms of Service" tab by default', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Directrices de uso, licenciamiento y cumplimiento con el EULA de Mojang Studios.')).toBeInTheDocument();
  });

  it('should switch to "Privacy Policy" tab when clicked', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Políticas de privacidad, almacenamiento seguro en OS Vault y cero telemetría invasiva.')).toBeInTheDocument();
  });

  it('should switch to "Help & Community Channels" tab when clicked', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('Help & Support'));
    expect(screen.getByText('Help & Community Channels')).toBeInTheDocument();
    expect(screen.getByText('Accede a nuestros canales oficiales de resolución de incidencias y soporte técnico.')).toBeInTheDocument();
  });

  it('should render the close button and call onClose when clicked', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should render the search input and update state on change', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    const searchInput = screen.getByPlaceholderText('Buscar términos y políticas...');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');
  });

  it('should render the correct branding header', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Legal & Policies')).toBeInTheDocument();
    expect(screen.getByText('Crystal Client Core')).toBeInTheDocument();
  });

  it('should render the correct sidebar info', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByText('Estatus Legal')).toBeInTheDocument();
    expect(screen.getByText('Vigente • 2026')).toBeInTheDocument();
  });

  it('should render the correct cloud sync state', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByText('●')).toBeInTheDocument();
    expect(screen.getByText('Crystal Cloud Verified')).toBeInTheDocument();
  });

  it('should handle initialTab prop correctly', () => {
    render(<LauncherLegalModal isOpen={true} initialTab="privacy" onClose={onCloseMock} />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Políticas de privacidad, almacenamiento seguro en OS Vault y cero telemetría invasiva.')).toBeInTheDocument();
  });

  it('should handle missing initialTab prop correctly', () => {
    render(<LauncherLegalModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Directrices de uso, licenciamiento y cumplimiento con el EULA de Mojang Studios.')).toBeInTheDocument();
  });
});
