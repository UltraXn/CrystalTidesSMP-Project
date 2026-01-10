import { Bug, Box, AlertTriangle, BarChart3, Lightbulb, HelpCircle } from 'lucide-react';

export interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    votes?: number;
}

export const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bug')) return <Bug size={14} />;
    if (t.includes('mod')) return <Box size={14} />;
    if (t.includes('complaint') || t.includes('queja')) return <AlertTriangle size={14} />;
    if (t.includes('poll') || t.includes('encuesta')) return <BarChart3 size={14} />;
    if (t.includes('general')) return <Lightbulb size={14} />;
    return <HelpCircle size={14} />;
}

export const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bug')) return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' };
    if (t.includes('mod')) return { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' };
    if (t.includes('complaint') || t.includes('queja')) return { bg: 'rgba(249, 115, 22, 0.2)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.4)' }; // Orange
    if (t.includes('poll') || t.includes('encuesta')) return { bg: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.4)' }; // Purple
    if (t.includes('general')) return { bg: 'rgba(14, 165, 233, 0.2)', text: '#7dd3fc', border: 'rgba(14, 165, 233, 0.4)' }; // Sky Blue
    return { bg: 'rgba(107, 114, 128, 0.2)', text: '#d1d5db', border: 'rgba(107, 114, 128, 0.4)' };
}

export const getStatusColor = (status?: string) => {
    switch (status) {
        case 'approved': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
        case 'rejected': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
        case 'implemented': return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
        default: return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' }; // Pending
    }
}
