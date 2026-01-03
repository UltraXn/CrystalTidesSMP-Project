const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Rule {
    id: number;
    category: string;
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    color?: string;
    sort_order: number;
}

export const getRules = async (): Promise<Rule[]> => {
    try {
        const response = await fetch(`${API_URL}/rules`);
        if (!response.ok) throw new Error('Failed to fetch rules');
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return json.success ? json.data : [];
        }
        return [];
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn("Backend connection failed, using MOCK rules");
            return [
                {
                    id: 1,
                    category: "General",
                    title: "Mock: Sé Amigable",
                    content: "No hagas spam y respeta a los demás jugadores.",
                    sort_order: 1
                }
            ];
        }
        throw error;
    }
};

export const createRule = async (rule: Omit<Rule, 'id'>, token: string): Promise<Rule> => {
    const response = await fetch(`${API_URL}/rules`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rule)
    });
    const contentType = response.headers.get("content-type");
    let json;
    if (contentType && contentType.includes("application/json")) {
        json = await response.json();
    } else {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(json?.error?.message || json?.message || 'Failed to create rule');
    }
    return json.data;
};

export const updateRule = async (id: number, updates: Partial<Rule>, token: string): Promise<Rule> => {
    const response = await fetch(`${API_URL}/rules/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    const contentType = response.headers.get("content-type");
    let json;
    if (contentType && contentType.includes("application/json")) {
        json = await response.json();
    } else {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(json?.error?.message || json?.message || 'Failed to update rule');
    }
    return json.data;
};

export const deleteRule = async (id: number, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/rules/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            throw new Error(json.error?.message || json.message || 'Failed to delete rule');
        } else {
            const text = await response.text();
            throw new Error(text || `Error ${response.status}`);
        }
    }
};
