import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '@/components/UI/MarkdownRenderer';

describe('MarkdownRenderer', () => {
    it('renders null when content is empty', () => {
        const { container } = render(<MarkdownRenderer content="" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders plain text correctly with pre-wrap', () => {
        const content = 'This is plain text with\nline break.';
        render(<MarkdownRenderer content={content} />);
        const span = screen.getByText(/This is plain text with/);
        expect(span).toBeInTheDocument();
        expect(span).toHaveStyle({ whiteSpace: 'pre-wrap' });
    });

    it('renders bold text inside strong tag', () => {
        render(<MarkdownRenderer content="**Bold text**" />);
        const strong = screen.getByText('Bold text');
        expect(strong.tagName).toBe('STRONG');
    });

    it('renders italic text inside em tag', () => {
        render(<MarkdownRenderer content="*Italic text*" />);
        const em = screen.getByText('Italic text');
        expect(em.tagName).toBe('EM');
    });

    it('renders images correctly with valid URLs', () => {
        const content = '![Banner Image](https://example.com/image.png)';
        render(<MarkdownRenderer content={content} />);
        const img = screen.getByAltText('Banner Image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('does not render images with malicious/invalid URLs', () => {
        const content = '![XSS](javascript:alert(1))';
        render(<MarkdownRenderer content={content} />);
        expect(screen.queryByAltText('XSS')).toBeNull();
    });

    it('renders links correctly with valid URLs', () => {
        const content = '[Click here](https://crystaltides.net)';
        render(<MarkdownRenderer content={content} />);
        const link = screen.getByRole('link', { name: 'Click here' });
        expect(link).toHaveAttribute('href', 'https://crystaltides.net');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders plain text for links with malicious URLs', () => {
        const content = '[Malicious Link](javascript:alert("XSS"))';
        render(<MarkdownRenderer content={content} />);
        expect(screen.getByText('Malicious Link')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Malicious Link' })).toBeNull();
    });

    it('renders images and links with relative URLs correctly', () => {
        const content = '![Icon](/images/icon.png) and [/docs](/docs/intro)';
        render(<MarkdownRenderer content={content} />);
        const img = screen.getByAltText('Icon');
        expect(img).toHaveAttribute('src', '/images/icon.png');
    });

    it('renders combined markdown formatting correctly', () => {
        const content = '**Important:** Check [our rules](/rules) and *stay safe*! ![Badge](https://img.shields.io/badge)';
        render(<MarkdownRenderer content={content} />);
        expect(screen.getByText('Important:').tagName).toBe('STRONG');
        expect(screen.getByRole('link', { name: 'our rules' })).toHaveAttribute('href', '/rules');
        expect(screen.getByText('stay safe').tagName).toBe('EM');
        expect(screen.getByAltText('Badge')).toBeInTheDocument();
    });
});
