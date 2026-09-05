import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import ResourceUsage from '@/components/Admin/Dashboard/ResourceUsage';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('ResourceUsage', () => {
    it('renders resources header and labels', () => {
        // Arrange & Act
        renderWithProviders(
            <ResourceUsage cpu={45} memory={{ current: 4096, limit: 8192 }} />
        );

        // Assert
        expect(screen.getByText('admin.dashboard.resources.title')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.resources.updated_now')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.resources.cpu')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.resources.ram')).toBeInTheDocument();
    });

    it('displays CPU usage percentage and formats bar', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <ResourceUsage cpu={78} memory={{ current: 2048, limit: 4096 }} />
        );

        // Assert
        expect(screen.getByText('78%')).toBeInTheDocument();
        const cpuBar = container.querySelector('div[style*="width: 78%"]');
        expect(cpuBar).toBeInTheDocument();
    });

    it('displays memory usage and calculates usage percentage', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <ResourceUsage cpu={20} memory={{ current: 6144, limit: 8192 }} />
        );

        // Assert: 6144 / 8192 = 75%
        expect(screen.getByText(/6144/)).toBeInTheDocument();
        expect(screen.getByText(/8192/)).toBeInTheDocument();
        const ramBar = container.querySelector('div[style*="width: 75%"]');
        expect(ramBar).toBeInTheDocument();
    });

    it('handles zero memory limit safely without division by zero', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <ResourceUsage cpu={10} memory={{ current: 0, limit: 0 }} />
        );

        // Assert
        const ramBar = container.querySelector('div[style*="width: 0%"]');
        expect(ramBar).toBeInTheDocument();
    });
});
