import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HoneypotInput from '@/components/UI/HoneypotInput';

describe('HoneypotInput Component', () => {
    it('should render with default name and correct styles', () => {
        render(<HoneypotInput />);
        const input = screen.getByRole('textbox', { hidden: true });
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('name', 'confirm_email');
        expect(input).toHaveAttribute('id', 'hp_confirm_email');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('tabIndex', '-1');
        expect(input).toHaveAttribute('autoComplete', 'off');

        const label = screen.getByText('Confirm Email (Leave Empty)');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'hp_confirm_email');

        const container = input.parentElement;
        expect(container).toHaveStyle({
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            opacity: '0',
            pointerEvents: 'none',
            height: '0px',
            width: '0px',
            overflow: 'hidden'
        });
        expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render with custom name and correct styles', () => {
        render(<HoneypotInput name="custom_name" />);
        const input = screen.getByRole('textbox', { hidden: true });
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('name', 'custom_name');
        expect(input).toHaveAttribute('id', 'hp_custom_name');

        const label = screen.getByText('Confirm Email (Leave Empty)');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'hp_custom_name');
    });

    it('should handle rerender with different name prop', () => {
        const { rerender } = render(<HoneypotInput name="initial_name" />);
        let input = screen.getByRole('textbox', { hidden: true });
        expect(input).toHaveAttribute('name', 'initial_name');

        rerender(<HoneypotInput name="updated_name" />);
        input = screen.getByRole('textbox', { hidden: true });
        expect(input).toHaveAttribute('name', 'updated_name');
    });
});
