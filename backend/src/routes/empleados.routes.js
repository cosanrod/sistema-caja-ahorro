import { Router } from 'express';
import { Temporal } from '@js-temporal/polyfill';
import { db } from '../prisma/db.js';
const router = Router();
/**
 * GET /api/empleados
 * Obtener todos los empleados
 */
router.get('/', async (_req, res) => {
    try {
        const empleados = await db.orm.public.Empleado.all();
        res.json({
            ok: true,
            data: empleados,
        });
    }
    catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener empleados',
        });
    }
});
/**
 * GET /api/empleados/:id
 * Obtener un empleado por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const empleado = await db.orm.public.Empleado
            .where({ id })
            .first();
        if (!empleado) {
            return res.status(404).json({
                ok: false,
                message: 'Empleado no encontrado',
            });
        }
        return res.json({
            ok: true,
            data: empleado,
        });
    }
    catch (error) {
        console.error('Error al obtener empleado:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener empleado',
        });
    }
});
/**
 * POST /api/empleados
 * Crear un empleado
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, apellidos, fecha_ingreso, datos_contacto, estado, } = req.body;
        // Validaciones básicas
        if (!nombre || !apellidos) {
            return res.status(400).json({
                ok: false,
                message: 'Nombre y apellidos son obligatorios',
            });
        }
        const empleado = await db.orm.public.Empleado.create({
            nombre,
            apellidos,
            // Se castea como any para saltar el conflicto de tipos del polyfill
            fecha_ingreso: (fecha_ingreso
                ? Temporal.Instant.from(fecha_ingreso)
                : Temporal.Now.instant()),
            datos_contacto: datos_contacto ?? null,
            estado: estado ?? 'ACTIVO',
        });
        return res.status(201).json({
            ok: true,
            data: empleado,
        });
    }
    catch (error) {
        console.error('Error al crear empleado:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error al crear empleado',
        });
    }
});
/**
 * PUT /api/empleados/:id
 * Actualizar un empleado
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellidos, fecha_ingreso, datos_contacto, estado, } = req.body;
        const empleadoActualizado = await db.orm.public.Empleado
            .where({ id })
            .update({
            nombre,
            apellidos,
            // Se castea como any de igual manera
            fecha_ingreso: fecha_ingreso
                ? Temporal.Instant.from(fecha_ingreso)
                : undefined,
            datos_contacto,
            estado,
        });
        if (!empleadoActualizado) {
            return res.status(404).json({
                ok: false,
                message: 'Empleado no encontrado',
            });
        }
        return res.json({
            ok: true,
            data: empleadoActualizado,
        });
    }
    catch (error) {
        console.error('Error al actualizar empleado:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar empleado',
        });
    }
});
/**
 * DELETE /api/empleados/:id
 * Eliminar un empleado
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const empleadoEliminado = await db.orm.public.Empleado
            .where({ id })
            .delete();
        if (!empleadoEliminado) {
            return res.status(404).json({
                ok: false,
                message: 'Empleado no encontrado',
            });
        }
        return res.json({
            ok: true,
            message: 'Empleado eliminado correctamente',
            data: empleadoEliminado,
        });
    }
    catch (error) {
        console.error('Error al eliminar empleado:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error al eliminar empleado',
        });
    }
});
export default router;
//# sourceMappingURL=empleados.routes.js.map