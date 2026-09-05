// Security Invariant: 2FA Session is tracked via HttpOnly Cookie on the server side.
// No tokens are persisted in sessionStorage or localStorage to prevent XSS leakage.
let adminTokenMemory: string | null = null;

export const setAdminToken = (token: string) => {
    adminTokenMemory = token;
};

export const getAdminToken = () => {
    return adminTokenMemory;
};

export const clearAdminToken = () => {
    adminTokenMemory = null;
};

export const getAuthHeaders = (sessionToken: string | null) => {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    
    // In-memory token fallback if needed for API headers
    if (adminTokenMemory) headers['x-admin-token'] = adminTokenMemory;
    
    return headers;
};
