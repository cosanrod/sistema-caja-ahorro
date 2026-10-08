import { Temporal } from '@js-temporal/polyfill';

// Inyectar Temporal globalmente para que Prisma 8 pueda codificar/decodificar las fechas
if (!globalThis.Temporal) {
  (globalThis as any).Temporal = Temporal;
}

import express from 'express';

import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env['PORT'] ?? 3000);

app.listen(PORT, () => {
  console.log(`🚀 API ejecutándose en http://localhost:${PORT}`);
});