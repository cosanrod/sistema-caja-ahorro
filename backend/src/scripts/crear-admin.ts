
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../prisma/db.js';

async function main() {
  const email = process.env['ADMIN_EMAIL']?.trim().toLowerCase();
  const password = process.env['ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      'Debes configurar ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env',
    );
  }

  if (password.length < 12) {
    throw new Error(
      'La contraseña del administrador debe tener al menos 12 caracteres',
    );
  }

  const existente = await db.orm.public.Usuario
    .where({ email })
    .first();

  if (existente) {
    console.log('Ya existe un usuario con ese correo. No se realizaron cambios.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const usuario = await db.orm.public.Usuario.create({
    email,
    password_hash: passwordHash,
    rol: 'ADMIN',
    estado: 'ACTIVO',
  });

  console.log('Administrador creado correctamente.');
  console.log(`Correo: ${usuario.email}`);
  console.log(`ID: ${usuario.id}`);
}

main().catch((error: unknown) => {
  console.error('No fue posible crear el administrador:', error);
  process.exitCode = 1;
});
