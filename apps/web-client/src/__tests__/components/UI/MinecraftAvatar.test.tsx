import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MinecraftAvatar from '@/components/UI/MinecraftAvatar';

describe('MinecraftAvatar', () => {
    it('should render with default props', () => {
        render(<MinecraftAvatar />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/MHF_Steve/120');
    });

    it('should render with custom src', () => {
        render(<MinecraftAvatar src="https://example.com/avatar.png" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    });

    it('should render with custom alt', () => {
        render(<MinecraftAvatar alt="Custom Alt" />);
        const img = screen.getByAltText('Custom Alt');
        expect(img).toBeInTheDocument();
    });

    it('should render with custom size', () => {
        render(<MinecraftAvatar size={64} />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('width', '64');
        expect(img).toHaveAttribute('height', '64');
    });

    it('should render with custom className', () => {
        render(<MinecraftAvatar className="custom-class" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveClass('custom-class');
    });

    it('should render with custom style', () => {
        render(<MinecraftAvatar style={{ border: '1px solid red' }} />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img.style.border).toBe('1px solid red');
    });

    it('should render with custom fallback on error', () => {
        render(<MinecraftAvatar src="https://example.com/invalid.png" fallback="https://example.com/fallback.png" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        fireEvent.error(img);
        expect(img).toHaveAttribute('src', 'https://example.com/fallback.png');
    });

    it('should render nickname correctly', () => {
        render(<MinecraftAvatar src="Steve" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/Steve/120');
    });

    it('should render skin texture correctly', () => {
        render(<MinecraftAvatar src="https://example.com/skin.png" />);
        const div = screen.getByRole('img', { name: /Avatar/i });
        expect(div).toBeInTheDocument();
        expect(div).toHaveStyle('background-image: url("https://example.com/skin.png")');
    });

    it('should handle onError event', () => {
        render(<MinecraftAvatar src="https://example.com/missing.png" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/missing.png');

        fireEvent.error(img);
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/MHF_Steve');
    });

    it('should handle nickname with fallback', () => {
        render(<MinecraftAvatar src="invalid-nickname" fallback="https://example.com/fallback.png" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/invalid-nickname/120');
    });

    it('should handle nickname with custom size', () => {
        render(<MinecraftAvatar src="Steve" size={64} />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/Steve/64');
    });

    it('should handle nickname with custom className', () => {
        render(<MinecraftAvatar src="Steve" className="custom-class" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveClass('custom-class');
    });

    it('should handle nickname with custom style', () => {
        render(<MinecraftAvatar src="Steve" style={{ border: '1px solid red' }} />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img.style.border).toBe('1px solid red');
    });

    it('should handle nickname with custom fallback', () => {
        render(<MinecraftAvatar src="invalid-nickname" fallback="https://example.com/fallback.png" />);
        const img = screen.getByAltText('Avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/invalid-nickname/120');
    });

    it('should handle nickname with custom alt', () => {
        render(<MinecraftAvatar src="Steve" alt="Custom Alt" />);
        const img = screen.getByAltText('Custom Alt');
        expect(img).toBeInTheDocument();
    });
});
