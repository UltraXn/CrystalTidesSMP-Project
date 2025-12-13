import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data; // Retornamos data por si el componente quiere usarla
    };

    // Función de Logout
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Función extra: Registro (Opcional, pero útil tenerla lista)
    // Función extra: Registro (Opcional, pero útil tenerla lista)
    const register = async (email, password, metadata = {}) => {
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

    const loginWithProvider = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/account'
            }
        });
        if (error) throw error;
        return data;
    };

    const updateUser = async (data) => {
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
