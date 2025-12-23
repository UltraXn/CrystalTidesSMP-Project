import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

import { User, Provider, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext) as AuthContextType;
};

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse['data']>;
    loginWithProvider: (provider: Provider) => Promise<OAuthResponse['data']>;
    logout: () => Promise<void>;
    register: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResponse['data']>;
    updateUser: (data: Record<string, any>) => Promise<User | undefined>;
    loading: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Verificar sesión activa al inicio
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Escuchar cambios de estado (Login, Logout, Token Refreshed) en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Función de Login
    const login = async (email: string, password: string): Promise<AuthResponse['data']> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    // Función de Logout
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Función extra: Registro (Opcional, pero útil tenerla lista)
    // Función extra: Registro (Opcional, pero útil tenerla lista)
    const register = async (email: string, password: string, metadata: Record<string, any> = {}): Promise<AuthResponse['data']> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        if (error) throw error;
        return data;
    };

    const loginWithProvider = async (provider: Provider): Promise<OAuthResponse['data']> => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/account'
            }
        });
        if (error) throw error;
        return data;
    };

    const updateUser = async (data: Record<string, any>): Promise<User | undefined> => {
        const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
            data: data
        });
        if (error) throw error;
        // Solo actualizamos el estado si tenemos un usuario válido de vuelta
        if (updatedUser) {
            setUser(updatedUser);
            return updatedUser;
        }
    };

    const value = {
        user,
        login,
        loginWithProvider,
        logout,
        register,
        updateUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
