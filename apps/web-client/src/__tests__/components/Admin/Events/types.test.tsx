import { describe, it, expect } from 'vitest';
import { getIconMap, getStatusMap } from '@/components/Admin/Events/types';

describe('Admin/Events types helpers', () => {
    it('returns icon map with expected keys', () => {
        const iconMap = getIconMap();
        expect(iconMap).toHaveProperty('hammer');
        expect(iconMap).toHaveProperty('dice');
        expect(iconMap).toHaveProperty('map');
        expect(iconMap).toHaveProperty('running');
    });

    it('returns status map with translations and colors', () => {
        const mockT = (key: string) => `translated_${key}`;
        const statusMap = getStatusMap(mockT);

        expect(statusMap.active.label).toBe('translated_admin.events.form.statuses.active');
        expect(statusMap.active.color).toBe('#4ade80');

        expect(statusMap.soon.label).toBe('translated_admin.events.form.statuses.soon');
        expect(statusMap.soon.color).toBe('#fbbf24');

        expect(statusMap.finished.label).toBe('translated_admin.events.form.statuses.finished');
        expect(statusMap.finished.color).toBe('#ef4444');
    });
});
