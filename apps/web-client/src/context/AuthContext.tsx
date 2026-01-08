import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Provider, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse['data']>;
    loginWithProvider: (provider: Provider) => Promise<OAuthResponse['data']>;
    logout: () => Promise<void>;
    register: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthResponse['data']>;
    updateUser: (data: Record<string, unknown>) => Promise<User | undefined>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext) as AuthContextType;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Verificar sesión activa al inicio
        const checkSession = async () => {
            try {
                // Usar getUser() en lugar de getSession() para asegurar datos frescos del servidor
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user ?? null);
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Escuchar cambios de estado
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Simplificado para evitar bucles infinitos y bloqueos
            // session.user viene del token JWT. Si necesitamos datos frescos post-link,
            // refreshSession() debe ser llamado explícitamente donde ocurra la acción.
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Revalidación Inteligente (Móvil/Tab Focus)
    // Cuando el usuario vuelve a la pestaña, verificamos si sus permisos cambiaron en el servidor.
    useEffect(() => {
        const handleFocus = async () => {
            if (document.visibilityState === 'visible') {
                const { data: { user: freshUser } } = await supabase.auth.getUser();
                if (freshUser) {
                    setUser(freshUser); 
                }
            }
        };

        window.addEventListener('visibilitychange', handleFocus);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('visibilitychange', handleFocus);
            window.removeEventListener('focus', handleFocus);
        }
    }, []);

    // 4. Auto-Sync Discord Username logic removed to prevent overwriting user preferences.
    // The user should manually set their name if they want it to match Discord.
    /*
    useEffect(() => {
        if (!user) return;
        const syncDiscordProfile = async () => {
             // ... logic removed ...
        };
        syncDiscordProfile();
    }, [user]);
    */

    // Función de Login
    const login = async (email: string, password: string): Promise<AuthResponse['data']> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            // Report Security Alert (Fire and forget)
            fetch(`${import.meta.env.VITE_API_URL}/logs/security/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    details: error.message 
                })
            }).catch(console.error); // Ignore reporting errors

            throw error;
        }
        return data;
    };

    // Función de Logout
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setUser(null);
        }
    };

    // Función extra: Registro (Opcional, pero útil tenerla lista)
    // Función extra: Registro (Opcional, pero útil tenerla lista)
    const register = async (email: string, password: string, metadata: Record<string, unknown> = {}): Promise<AuthResponse['data']> => {
        // Ensure we send the correct production URL if we are not on localhost (forcing HTTPS for prod)
        const productionUrl = 'https://crystaltidessmp.net/login';
        const redirectUrl = window.location.hostname.includes('localhost') 
            ? window.location.origin + '/login' 
            : productionUrl;

        console.log("Registering with Email Redirect:", redirectUrl);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: redirectUrl
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

    const updateUser = async (data: Record<string, unknown>): Promise<User | undefined> => {
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
