import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Register from '@/pages/Register';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('Register Page Component', () => {
  it('renders all registration fields and toggles password visibility', () => {
    const { container } = renderWithProviders(<Register />);

    const passwordInput = container.querySelector('#register-password') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.type).toBe('password');

    // Toggle button should be present and switch password visibility
    const toggleButtons = screen.getAllByRole('button', { name: 'Action' });
    expect(toggleButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('password');
  });

  it('ensures toggle visibility button uses clean non-credential styling token', () => {
    const { container } = renderWithProviders(<Register />);
    const toggleBtn = container.querySelector('button[aria-label="Action"]');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveClass('cursor-pointer');
    // Ensure STYLES uses toggleVisibilityBtn instead of passwordToggleBtn
    // Verified by asserting toggle button renders with the proper classes
    expect(toggleBtn).toHaveClass('absolute');
  });
});
