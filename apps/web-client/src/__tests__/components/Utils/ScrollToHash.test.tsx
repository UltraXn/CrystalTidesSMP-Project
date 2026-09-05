import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScrollToHash from '@/components/Utils/ScrollToHash';
import { renderWithProviders } from '@/utils/test-utils';

describe('ScrollToHash', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('scrolls to top when navigation has no hash or known path', () => {
        renderWithProviders(<ScrollToHash />, { initialEntries: ['/about'] });

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('scrolls target element into view when hash is provided in URL', () => {
        const targetElement = document.createElement('div');
        targetElement.id = 'faq';
        targetElement.scrollIntoView = vi.fn();
        document.body.appendChild(targetElement);

        renderWithProviders(<ScrollToHash />, { initialEntries: ['/help#faq'] });

        vi.advanceTimersByTime(150);

        expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('scrolls mapped element into view for known hashless path like /rules', () => {
        const rulesElement = document.createElement('div');
        rulesElement.id = 'rules';
        rulesElement.scrollIntoView = vi.fn();
        document.body.appendChild(rulesElement);

        renderWithProviders(<ScrollToHash />, { initialEntries: ['/rules'] });

        vi.advanceTimersByTime(150);

        expect(rulesElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
});
