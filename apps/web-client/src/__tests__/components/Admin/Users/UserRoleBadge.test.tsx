import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import { UserRoleBadge } from '@/components/Admin/Users/UserRoleBadge';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('UserRoleBadge', () => {
    it('renders image badge for known role like admin', () => {
        renderWithProviders(<UserRoleBadge role="admin" />);

        const img = screen.getByRole('img', { name: 'admin' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/ranks/admin.png');
        expect(img).toHaveAttribute('title', 'account.roles.admin');
    });

    it('renders image badge for staff role with fallback title', () => {
        renderWithProviders(<UserRoleBadge role="staff" />);

        const img = screen.getByRole('img', { name: 'staff' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/ranks/staff.png');
    });

    it('falls back to user badge for unknown role', () => {
        renderWithProviders(<UserRoleBadge role="unknown_role" />);

        const img = screen.getByRole('img', { name: 'unknown_role' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/ranks/user.png');
    });
});
