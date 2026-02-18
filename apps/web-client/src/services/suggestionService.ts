const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Suggestion {
    id: number;
    nickname: string;
    type: string;
    message: string;
    created_at: string;
}

export const createSuggestion = async (data: { nickname: string; type: string; message: string }) => {
    const res = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Failed to create suggestion');
    return res.json();
};
