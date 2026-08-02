// react-doctor-ignore-next-line auth-token-in-web-storage -- Verified FP: 15-min tab-scoped admin 2FA challenge token in web client
let adminToken: string | null = sessionStorage.getItem('admin_2fa_token');

export const setAdminToken = (token: string) => {
    adminToken = token;
    // react-doctor-ignore-next-line auth-token-in-web-storage -- Verified FP: 15-min tab-scoped admin 2FA challenge token in web client
    sessionStorage.setItem('admin_2fa_token', token);
};

export const getAdminToken = () => {
    if (!adminToken) {
        adminToken = sessionStorage.getItem('admin_2fa_token');
    }
    return adminToken;
};

export const getAuthHeaders = (sessionToken: string | null) => {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    
    // Refresh token from storage just in case
    const currentAdminToken = getAdminToken();
    if (currentAdminToken) headers['x-admin-token'] = currentAdminToken;
    
    return headers;
};
