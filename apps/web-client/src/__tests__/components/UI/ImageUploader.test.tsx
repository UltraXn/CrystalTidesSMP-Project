import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ImageUploader from '@/components/UI/ImageUploader';
import { uploadImage } from '@/components/UI/../../services/uploadService';

vi.mock('../../../services/uploadService', () => ({
    uploadImage: vi.fn(),
}));

describe('ImageUploader', () => {
    const mockOnImageUploaded = vi.fn();
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
        globalThis.URL.revokeObjectURL = vi.fn();
        
        // Mock Canvas toBlob
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            drawImage: vi.fn(),
        }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
            callback(new Blob(['mock-webp'], { type: 'image/webp' }));
        }) as unknown as typeof HTMLCanvasElement.prototype.toBlob;

        // Mock Image loading
        Object.defineProperty(global.Image.prototype, 'src', {
            set() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 10);
            },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the initial state with upload button correctly', () => {
        render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
        expect(screen.getByText('Subir Imagen (WebP)')).toBeInTheDocument();
        expect(screen.getByLabelText('Input field')).toBeInTheDocument();
    });

    it('renders current image when provided', () => {
        render(<ImageUploader onImageUploaded={mockOnImageUploaded} currentImage="https://example.com/test.webp" />);
        expect(screen.getByText('Cambiar Imagen')).toBeInTheDocument();
        const img = screen.getByAltText('Uploaded');
        expect(img).toHaveAttribute('src', 'https://example.com/test.webp');
    });

    it('processes and uploads an image successfully', async () => {
        vi.mocked(uploadImage).mockResolvedValue('https://example.com/saved.webp');
        render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
        
        const fileInput = screen.getByLabelText('Input field') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        await waitFor(() => {
            expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/saved.webp');
        });
    });

    it('handles image upload failure with alert', async () => {
        vi.mocked(uploadImage).mockRejectedValue(new Error('Network error'));
        render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
        
        const fileInput = screen.getByLabelText('Input field') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error al subir imagen. Verifica permisos o consola.');
        });
    });
});
