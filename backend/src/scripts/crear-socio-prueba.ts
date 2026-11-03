
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Temporal } from '@js-temporal/polyfill';
import { db } from '../prisma/db.js';

// Registrar Temporal globalmente para Prisma 8
const temporalGlobal = globalThis as any;

if (!temporalGlobal.Temporal) {
  temporalGlobal.Temporal = Temporal;
}

async function main() {
  const email = process.env['SOCIO_TEST_EMAIL']
    ?.trim()
    .toLowerCase();

  const password = process.env['SOCIO_TEST_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      'Debes configurar SOCIO_TEST_EMAIL y SOCIO_TEST_PASSWORD en .env',
    );
  }

  if (password.length < 12) {
    throw new Error(
      'La contraseña debe tener al menos 12 caracteres',
    );
  }

  // Evitar duplicar el usuario de prueba
  const usuarioExistente = await db.orm.public.Usuario
    .where({ email })
    .first();

  if (usuarioExistente) {
    console.log('El usuario de prueba ya existe. No se realizaron cambios.');
    return;
  }

  // Crear empleado de prueba
  const empleado = await db.orm.public.Empleado.create({
    nombre: 'SOCIO',
    apellidos: 'PRUEBA',
    datos_contacto: email,
    estado: 'ACTIVO',
  });

  // Cifrar contraseña
  const passwordHash = await bcrypt.hash(password, 12);

  // Crear usuario vinculado al empleado
  const usuario = await db.orm.public.Usuario.create({
    email,
    password_hash: passwordHash,
    rol: 'SOCIO',
    estado: 'ACTIVO',
    empleado_id: empleado.id,
  });

  console.log('Usuario SOCIO creado correctamente.');
  console.log(`Correo: ${usuario.email}`);
  console.log(`Rol: ${usuario.rol}`);
  console.log(`ID usuario: ${usuario.id}`);
  console.log(`ID empleado: ${empleado.id}`);
}

main().catch((error: unknown) => {
  console.error('No fue posible crear el socio de prueba:', error);
  process.exitCode = 1;
});
