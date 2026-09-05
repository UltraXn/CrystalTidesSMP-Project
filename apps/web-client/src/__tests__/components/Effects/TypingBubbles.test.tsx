import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, act } from '@testing-library/react';
import TypingBubbles from '@/components/Effects/TypingBubbles';
import { renderWithProviders } from '@/utils/test-utils';

describe('TypingBubbles', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('spawns a typing bubble when a key is pressed and clears after timeout', () => {
        renderWithProviders(<TypingBubbles />);

        const container = document.body.querySelector('.typing-bubbles-container');
        expect(container).toBeInTheDocument();

        expect(document.body.querySelectorAll('.typing-bubble').length).toBe(0);

        act(() => {
            fireEvent.keyDown(window, { key: 'a' });
        });
        expect(document.body.querySelectorAll('.typing-bubble').length).toBe(1);

        act(() => {
            vi.advanceTimersByTime(2500);
        });
        expect(document.body.querySelectorAll('.typing-bubble').length).toBe(0);
    });
});
