import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '@/components/UI/StatCard';

describe('StatCard Component', () => {
    it('renders title, value, percent and icon correctly', () => {
        render(
            <StatCard 
                title="Usuarios Activos" 
                value="1,450" 
                percent="+15% este mes" 
                icon={<span data-testid="custom-icon">🔥</span>} 
            />
        );

        expect(screen.getByRole('heading', { level: 4, name: 'Usuarios Activos' })).toBeInTheDocument();
        expect(screen.getByText('1,450')).toBeInTheDocument();
        expect(screen.getByText('+15% este mes')).toBeInTheDocument();
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders with custom hex color styling', () => {
        render(
            <StatCard 
                title="Ingresos" 
                value="$12,500" 
                percent="+8%" 
                color="#10b981" 
                icon={<span>💰</span>} 
            />
        );

        const percentSpan = screen.getByText('+8%');
        expect(percentSpan).toHaveStyle({ color: '#10b981' });
    });

    it('supports rerendering with updated value', () => {
        const { rerender } = render(
            <StatCard 
                title="Ping" 
                value="24ms" 
                percent="Estable" 
                icon={<span>📶</span>} 
            />
        );

        expect(screen.getByText('24ms')).toBeInTheDocument();

        rerender(
            <StatCard 
                title="Ping" 
                value="18ms" 
                percent="Excelente" 
                icon={<span>📶</span>} 
            />
        );

        expect(screen.getByText('18ms')).toBeInTheDocument();
        expect(screen.getByText('Excelente')).toBeInTheDocument();
    });
});
