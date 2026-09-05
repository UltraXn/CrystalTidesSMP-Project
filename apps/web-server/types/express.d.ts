export {};

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username?: string;
                role: string;
                email?: string;
                avatar_url?: string;
                minecraft_uuid?: string;
                app_metadata?: {
                    two_factor_enabled?: boolean;
                    two_factor_secret?: string;
                    [key: string]: unknown;
                };
            };
            deviceId?: string;
        }
    }
}
