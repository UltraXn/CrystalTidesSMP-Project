import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import WikiArticleFormModal from '@/components/Admin/Wiki/WikiArticleFormModal';
import { WikiArticle } from '@/services/wikiService';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

vi.mock('../../Wiki/WikiBoss3DCard', () => ({
    default: ({ bossName }: { bossName: string }) => (
        <div data-testid="mock-3d-card">{bossName}</div>
    ),
}));

vi.mock('framer-motion', () => ({
    m: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('WikiArticleFormModal', () => {
    const mockInitialData: Partial<WikiArticle> = {
        title: 'Nether Fortress Exploration',
        slug: 'nether-fortress',
        category: 'guias_generales',
        content: 'How to safely navigate the nether fortress.',
    };

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn().mockResolvedValue(undefined),
        initialData: mockInitialData,
        isEditing: true,
        saving: false,
    };

    it('renders modal in edit mode with populated fields', () => {
        renderWithProviders(<WikiArticleFormModal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('admin.wiki.edit_title');
        expect(screen.getByLabelText('admin.wiki.title_label')).toHaveValue('Nether Fortress Exploration');
        expect(screen.getByLabelText('admin.wiki.slug_label')).toHaveValue('nether-fortress');
        expect(screen.getByLabelText('admin.wiki.content_label')).toHaveValue('How to safely navigate the nether fortress.');
        expect(screen.getByRole('button', { name: /admin.wiki.update_btn/i })).toBeInTheDocument();
    });

    it('renders modal in create mode when isEditing is false', () => {
        renderWithProviders(
            <WikiArticleFormModal {...defaultProps} isEditing={false} initialData={null} />
        );

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('admin.wiki.new_title');
        expect(screen.getByRole('button', { name: /admin.wiki.publish_btn/i })).toBeInTheDocument();
    });

    it('switches between editor and preview mode', async () => {
        const user = userEvent.setup();
        renderWithProviders(<WikiArticleFormModal {...defaultProps} />);

        const previewTabBtn = screen.getByRole('button', { name: /Vista Previa en Vivo/i });
        await user.click(previewTabBtn);

        expect(screen.getByRole('heading', { level: 1, name: 'Nether Fortress Exploration' })).toBeInTheDocument();
        expect(screen.getByText('How to safely navigate the nether fortress.')).toBeInTheDocument();

        const editorTabBtn = screen.getByRole('button', { name: /Editor/i });
        await user.click(editorTabBtn);

        expect(screen.getByLabelText('admin.wiki.title_label')).toBeInTheDocument();
    });

    it('submits form with updated values and calls onSave', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderWithProviders(
            <WikiArticleFormModal {...defaultProps} onSave={onSave} />
        );

        const titleInput = screen.getByLabelText('admin.wiki.title_label');
        await user.clear(titleInput);
        await user.type(titleInput, 'Advanced Nether Guide');

        const submitBtn = screen.getByRole('button', { name: /admin.wiki.update_btn/i });
        await user.click(submitBtn);

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Advanced Nether Guide',
            })
        );
    });

    it('calls onClose when clicking the close or cancel button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(<WikiArticleFormModal {...defaultProps} onClose={onClose} />);

        const closeBtn = screen.getByRole('button', { name: 'Cerrar ventana' });
        await user.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        const cancelBtn = screen.getByRole('button', { name: 'admin.wiki.cancel' });
        await user.click(cancelBtn);
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});
