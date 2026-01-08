import { Request, Response } from 'express';
import supabase from '../services/supabaseService.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        // Lógica de registro pendiente...
        console.log('Register attempt:', { username, email, hasPassword: !!password });
        res.json({ message: 'Registro exitoso (Simulado)' });
    } catch {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Lógica de login pendiente...
        console.log('Login attempt:', { email, hasPassword: !!password });
        res.json({
            message: 'Login exitoso (Simulado)',
            token: 'fake-jwt-token-xyz',
            user: { email, role: 'user' }
        });
    } catch {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // Validar token y devolver info del usuario
    res.json({ user: { name: 'Usuario Verificado' } });
};

export const unlinkIdentity = async (req: Request, res: Response) => {
    try {
        const { identityId } = req.body;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user; // Authenticated user from middleware

        if (!identityId) {
            return res.status(400).json({ message: 'Falta identityId' });
        }

        if (!user || !user.id) {
             return res.status(401).json({ message: 'No autenticado' });
        }

        console.log(`Attempting to unlink identity ${identityId} for user ${user.id}`);

        // Verify that the identity belongs to the user prevents deleting other people's identities
        // We can fetch the user first
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
        
        if (userError || !userData.user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const identity = userData.user.identities?.find((id: { identity_id: string; id: string }) => id.identity_id === identityId || id.id === identityId);
        
        if (!identity) {
             // If not found, maybe it's already deleted or doesn't belong to use
             // But for safety, we allow if we can confirm ownership.
             // If we can't find it in user identities, we stop.
             return res.status(403).json({ message: 'Identidad no encontrada o no pertenece al usuario' });
        }

        // Proceed to unlink
        // Note: deleteUserIdentity takes the identity ID (string)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.auth.admin as any).deleteUserIdentity(identityId);

        if (error) {
            console.error("Supabase Admin Unlink Error:", error);
            throw error;
        }

        res.json({ success: true, message: 'Identidad desvinculada correctamente' });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("Unlink Controller Error:", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errMessage = (error as any).message || 'Error al desvincular identidad';
        res.status(500).json({ message: errMessage });
    }
};
