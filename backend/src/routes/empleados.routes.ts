import { Router } from 'express';
import { db } from '../prisma/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const empleados = await db.orm.public.Empleado.all();

    res.json({
      ok: true,
      data: empleados,
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);

    res.status(500).json({
      ok: false,
      message: 'Error al obtener empleados',
    });
  }
});

export default router;