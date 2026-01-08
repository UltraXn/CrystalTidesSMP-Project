import { createContext } from 'react';
import { User, Provider, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse['data']>;
    loginWithProvider: (provider: Provider) => Promise<OAuthResponse['data']>;
    logout: () => Promise<void>;
    register: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthResponse['data']>;
    updateUser: (data: Record<string, unknown>) => Promise<User | undefined>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
