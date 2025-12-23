import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js'; // Asumiendo que usaremos DB pronto
import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        // Lógica de registro pendiente...
        res.json({ message: 'Registro exitoso (Simulado)' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Lógica de login pendiente...
        // 1. Buscar usuario por email
        // 2. Comparar password con bcrypt.compare()
        // 3. Generar token JWT
        res.json({
            message: 'Login exitoso (Simulado)',
            token: 'fake-jwt-token-xyz',
            user: { email, role: 'user' }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // Validar token y devolver info del usuario
    res.json({ user: { name: 'Usuario Verificado' } });
};
