import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            message: 'Token de acceso requerido',
        });
    }
    const token = authHeader.substring(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (typeof payload !== 'object' ||
            !payload ||
            typeof payload.id !== 'string' ||
            typeof payload.email !== 'string' ||
            typeof payload.rol !== 'string') {
            return res.status(401).json({
                ok: false,
                message: 'Token inválido',
            });
        }
        req.usuario = {
            id: payload.id,
            email: payload.email,
            rol: payload.rol,
        };
        next();
    }
    catch {
        return res.status(401).json({
            ok: false,
            message: 'Token inválido o expirado',
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map