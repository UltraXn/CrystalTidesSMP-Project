import React from 'react';
import { CheckCircle, Hourglass, Flag, Hammer, Dices, Map, Footprints } from 'lucide-react';

export interface Event {
    id?: number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: string;
    status: string;
    image_url?: string;
    registrations?: Registration[];
}

export interface Registration {
    id: number;
    created_at: string;
    profiles?: {
        avatar_url?: string;
        username?: string;
    }
}

// Helper maps
export const getIconMap = (): {[key: string]: React.ReactNode} => ({
    'hammer': <Hammer />,
    'dice': <Dices />,
    'map': <Map />,
    'running': <Footprints />
});

export const getStatusMap = (t: (key: string) => string): {[key: string]: { label: string, icon: React.ReactNode, color: string }} => ({
    'active': { label: t('admin.events.form.statuses.active'), icon: <CheckCircle />, color: '#4ade80' },
    'soon': { label: t('admin.events.form.statuses.soon'), icon: <Hourglass />, color: '#fbbf24' },
    'finished': { label: t('admin.events.form.statuses.finished'), icon: <Flag />, color: '#ef4444' }
});
