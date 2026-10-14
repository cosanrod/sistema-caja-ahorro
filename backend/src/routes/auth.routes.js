import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../prisma/db.js';
const router = Router();
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}
;
/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                message: 'Email y contraseña son obligatorios',
            });
        }
        const usuario = await db.orm.public.Usuario
            .where({ email })
            .first();
        if (!usuario) {
            return res.status(401).json({
                ok: false,
                message: 'Credenciales inválidas',
            });
        }
        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({
                ok: false,
                message: 'El usuario no está activo',
            });
        }
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({
                ok: false,
                message: 'Credenciales inválidas',
            });
        }
        const token = jwt.sign({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
        }, JWT_SECRET, {
            expiresIn: '8h',
        });
        return res.json({
            ok: true,
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error en el servidor durante el login',
        });
    }
});
export default router;
//# sourceMappingURL=auth.routes.js.map