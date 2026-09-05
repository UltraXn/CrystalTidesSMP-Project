import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from '@/components/UI/Loader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('Loader Component', () => {
    it('should render minimal loader with spinner', () => {
        const { container } = render(<Loader minimal />);
        expect(container.querySelector('.loader-minimal')).toBeInTheDocument();
        expect(container.querySelector('.spinner')).toBeInTheDocument();
        expect(screen.queryByAltText('Crystal Tides')).not.toBeInTheDocument();
    });

    it('should render minimal loader with custom size and text', () => {
        const { container } = render(<Loader minimal size={48} text="Cargando mapa..." />);
        const minimalWrapper = container.querySelector('.loader-minimal') as HTMLElement;
        expect(minimalWrapper).toBeInTheDocument();
        expect(minimalWrapper).toHaveStyle({ width: '48px', height: '48px' });
        expect(screen.getByText('Cargando mapa...')).toBeInTheDocument();
    });

    it('should render standard loader with logo and default text', () => {
        render(<Loader />);
        const img = screen.getByAltText('Crystal Tides');
        expect(img).toBeInTheDocument();
        expect(screen.getByText('common.loading_content')).toBeInTheDocument();
    });

    it('should render fullScreen loader with custom text', () => {
        const { container } = render(<Loader fullScreen text="Iniciando sesión..." />);
        expect(container.querySelector('.loader-fullscreen')).toBeInTheDocument();
        expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    });

    it('should not render text when text is explicitly empty string', () => {
        render(<Loader text="" />);
        expect(screen.queryByText('common.loading_content')).not.toBeInTheDocument();
    });

    it('should apply custom container styles', () => {
        const { container } = render(<Loader style={{ opacity: 0.8 }} />);
        const wrapper = container.querySelector('.premium-loader-container') as HTMLElement;
        expect(wrapper).toHaveStyle({ opacity: '0.8' });
    });
});
