
import { Router } from 'express';
import { db } from '../prisma/db.js';
import {
  authenticateToken,
  type AuthenticatedRequest,
} from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/perfil
 * Obtener el perfil del usuario autenticado
 */
router.get('/', async (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const usuarioAuth = authenticatedReq.usuario;

    if (!usuarioAuth) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado',
      });
    }

    // Buscar al usuario identificado por el JWT.
    const usuario = await db.orm.public.Usuario
      .where({ id: usuarioAuth.id })
      .first();

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar que la cuenta continúe activa.
    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({
        ok: false,
        message: 'El usuario no está activo',
      });
    }

    // Comprobar que exista un empleado asociado.
    if (!usuario.empleado_id) {
      return res.status(404).json({
        ok: false,
        message: 'El usuario no tiene un empleado asociado',
      });
    }

    // Consultar únicamente al empleado relacionado con el usuario.
    const empleado = await db.orm.public.Empleado
      .where({ id: usuario.empleado_id })
      .first();

    if (!empleado) {
      return res.status(404).json({
        ok: false,
        message: 'No se encontró el empleado asociado',
      });
    }

    return res.json({
      ok: true,
      data: {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
        },
        empleado,
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener el perfil',
    });
  }
});

export default router;
