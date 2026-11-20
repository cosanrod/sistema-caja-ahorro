
import { Router } from 'express';
import { db } from '../prisma/db.js';
import {
  authenticateToken,
  type AuthenticatedRequest,
} from '../middleware/auth.middleware.js';
import { authorizePermissions } from '../middleware/authorize.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación.
router.use(authenticateToken);

/**
 * GET /api/ahorros/mi-cuenta
 * Consultar la cuenta de ahorro del usuario autenticado.
 */
router.get(
  '/mi-cuenta',
  authorizePermissions('ahorro:consultar-propio'),
  async (req, res) => {
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

      // Verificar que el usuario continúe activo.
      if (usuario.estado !== 'ACTIVO') {
        return res.status(403).json({
          ok: false,
          message: 'El usuario no está activo',
        });
      }

      // Comprobar que tenga un empleado asociado.
      if (!usuario.empleado_id) {
        return res.status(404).json({
          ok: false,
          message: 'El usuario no tiene un empleado asociado',
        });
      }

      // Buscar al empleado relacionado con el usuario.
      const empleado = await db.orm.public.Empleado
        .where({ id: usuario.empleado_id })
        .first();

      if (!empleado) {
        return res.status(404).json({
          ok: false,
          message: 'No se encontró el empleado asociado',
        });
      }

      // Buscar la cuenta vinculada exclusivamente a ese empleado.
      const cuenta = await db.orm.public.CuentaAhorro
        .where({ empleado_id: empleado.id })
        .first();

      if (!cuenta) {
        return res.status(404).json({
          ok: false,
          message: 'El empleado todavía no tiene una cuenta de ahorro',
        });
      }

      return res.json({
        ok: true,
        data: {
          cuenta,
        },
      });
    } catch (error) {
      console.error('Error al consultar cuenta de ahorro:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error al consultar la cuenta de ahorro',
      });
    }
  },
);


/**
 * POST /api/ahorros
 * Crear una cuenta de ahorro para un empleado.
 */
router.post(
  '/',
  authorizePermissions('ahorro:administrar-cuentas'),
  async (req, res) => {
    try {
      const {
        empleado_id,
        aportacion_obligatoria,
        periodicidad,
      } = req.body;

      // Validar campos obligatorios.
      if (
        typeof empleado_id !== 'string' ||
        !empleado_id.trim()
      ) {
        return res.status(400).json({
          ok: false,
          message: 'El ID del empleado es obligatorio',
        });
      }

      // Validar que la aportación sea una cadena decimal válida.
      if (
        typeof aportacion_obligatoria !== 'string' ||
        !/^\d+(\.\d{1,2})?$/.test(aportacion_obligatoria)
      ) {
        return res.status(400).json({
          ok: false,
          message: 'La aportación debe ser un importe decimal válido con máximo dos decimales',
        });
      }

      // Evitar aportaciones iguales a cero.
      if (!/[1-9]/.test(aportacion_obligatoria)) {
        return res.status(400).json({
          ok: false,
          message: 'La aportación obligatoria debe ser mayor que cero',
        });
      }

      // Validar periodicidad.
      const periodicidadesValidas = [
        'SEMANAL',
        'QUINCENAL',
        'MENSUAL',
      ];

      const periodicidadFinal = periodicidad ?? 'SEMANAL';

      if (
        typeof periodicidadFinal !== 'string' ||
        !periodicidadesValidas.includes(periodicidadFinal)
      ) {
        return res.status(400).json({
          ok: false,
          message: 'La periodicidad debe ser SEMANAL, QUINCENAL o MENSUAL',
        });
      }

      // Comprobar que el empleado exista.
      const empleado = await db.orm.public.Empleado
        .where({ id: empleado_id })
        .first();

      if (!empleado) {
        return res.status(404).json({
          ok: false,
          message: 'Empleado no encontrado',
        });
      }

      // Verificar que el empleado esté activo.
      if (empleado.estado !== 'ACTIVO') {
        return res.status(400).json({
          ok: false,
          message: 'No se puede crear una cuenta para un empleado inactivo',
        });
      }

      // Comprobar que el empleado no tenga otra cuenta.
      const cuentaExistente = await db.orm.public.CuentaAhorro
        .where({ empleado_id })
        .first();

      if (cuentaExistente) {
        return res.status(409).json({
          ok: false,
          message: 'El empleado ya tiene una cuenta de ahorro',
        });
      }

      // Crear la cuenta con saldo inicial en cero.
      const cuenta = await db.orm.public.CuentaAhorro.create({
        empleado_id,
        saldo: '0.00',
        aportacion_obligatoria,
        periodicidad: periodicidadFinal as
          'SEMANAL' | 'QUINCENAL' | 'MENSUAL',
        estado: 'ACTIVA',
      });

      return res.status(201).json({
        ok: true,
        message: 'Cuenta de ahorro creada correctamente',
        data: cuenta,
      });
    } catch (error) {
      console.error('Error al crear cuenta de ahorro:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error al crear la cuenta de ahorro',
      });
    }
  },
);

export default router;
