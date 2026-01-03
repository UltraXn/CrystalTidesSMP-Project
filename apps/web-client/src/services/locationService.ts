const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface LocationAuthor {
    name: string;
    role: string;
}

export interface WorldLocation {
    id: number;
    title: string;
    description: string;
    long_description: string;
    coords: string;
    image_url: string | null;
    is_coming_soon: boolean;
    authors: LocationAuthor[];
    sort_order: number;
}

export const getLocations = async (): Promise<WorldLocation[]> => {
    try {
        const response = await fetch(`${API_URL}/locations`);
        if (!response.ok) throw new Error('Failed to fetch locations');
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return json.success ? json.data : [];
        }
        return [];
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn("Backend connection failed, using MOCK locations");
            return [
                {
                    id: 1,
                    title: "Mock: Gran Biblioteca",
                    description: "Una biblioteca antigua llena de secretos.",
                    long_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    coords: "100, 64, 200",
                    image_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
                    is_coming_soon: false,
                    authors: [{ name: "Admin", role: "architect" }],
                    sort_order: 1
                }
            ];
        }
        throw error;
    }
};

export const createLocation = async (location: Omit<WorldLocation, 'id'>, token: string): Promise<WorldLocation> => {
    const response = await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(location)
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
        throw new Error(json?.error?.message || json?.message || 'Failed to create location');
    }
    return json.data;
};

export const updateLocation = async (id: number, updates: Partial<WorldLocation>, token: string): Promise<WorldLocation> => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
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
        throw new Error(json?.error?.message || json?.message || 'Failed to update location');
    }
    return json.data;
};

export const deleteLocation = async (id: number, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            throw new Error(json.error?.message || json.message || 'Failed to delete location');
        } else {
            const text = await response.text();
            throw new Error(text || `Error ${response.status}`);
        }
    }
};
