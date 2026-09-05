import { describe, it, expect } from 'vitest';
import { getTypeIcon, getTypeColor, getStatusColor } from '@/components/Admin/Suggestions/types';

describe('Admin/Suggestions types helpers', () => {
    describe('getTypeIcon', () => {
        it('returns icon for different suggestion types', () => {
            expect(getTypeIcon('bug')).toBeDefined();
            expect(getTypeIcon('mod')).toBeDefined();
            expect(getTypeIcon('complaint')).toBeDefined();
            expect(getTypeIcon('queja')).toBeDefined();
            expect(getTypeIcon('poll')).toBeDefined();
            expect(getTypeIcon('encuesta')).toBeDefined();
            expect(getTypeIcon('general')).toBeDefined();
            expect(getTypeIcon('other')).toBeDefined();
        });
    });

    describe('getTypeColor', () => {
        it('returns proper color palette for each type', () => {
            expect(getTypeColor('bug').text).toBe('#fca5a5');
            expect(getTypeColor('mod').text).toBe('#93c5fd');
            expect(getTypeColor('complaint').text).toBe('#fdba74');
            expect(getTypeColor('poll').text).toBe('#d8b4fe');
            expect(getTypeColor('general').text).toBe('#7dd3fc');
            expect(getTypeColor('other').text).toBe('#d1d5db');
        });
    });

    describe('getStatusColor', () => {
        it('returns proper color palette for each status', () => {
            expect(getStatusColor('approved').text).toBe('#4ade80');
            expect(getStatusColor('rejected').text).toBe('#f87171');
            expect(getStatusColor('implemented').text).toBe('#c084fc');
            expect(getStatusColor('pending').text).toBe('#94a3b8');
            expect(getStatusColor(undefined).text).toBe('#94a3b8');
        });
    });
});
