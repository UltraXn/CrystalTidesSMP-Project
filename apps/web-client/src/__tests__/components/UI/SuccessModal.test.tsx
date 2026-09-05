import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuccessModal from '@/components/UI/SuccessModal';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...(p as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
    button: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <button {...(p as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
  },
  m: {
    div: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...(p as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
    button: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <button {...(p as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>
}));

describe('SuccessModal', () => {
  let onCloseMock: Mock;
  let onActionMock: Mock;

  beforeEach(() => {
    onCloseMock = vi.fn();
    onActionMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<SuccessModal isOpen={false} onClose={onCloseMock} title="Success" message="Operation completed" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display the correct title', () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    expect(screen.getByRole('heading', { level: 2, name: /success/i })).toBeInTheDocument();
  });

  it('should display the correct message', () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    expect(screen.getByText(/operation completed/i)).toBeInTheDocument();
  });

  it('should display the correct button text', () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" buttonText="Close" />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call onClose when the button is clicked', async () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /aceptar/i }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should call onAction when the button is clicked', async () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" onAction={onActionMock} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /aceptar/i }));
    expect(onActionMock).toHaveBeenCalled();
  });

  it('should call onClose when onAction is not provided', async () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /aceptar/i }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should render the logo and check icon correctly', () => {
    render(<SuccessModal isOpen={true} onClose={onCloseMock} title="Success" message="Operation completed" />);
    expect(screen.getByAltText(/crystaltides/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /check circle/i })).toBeInTheDocument();
  });
});
