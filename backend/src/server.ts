import { Temporal } from '@js-temporal/polyfill';
import express from 'express';
import 'dotenv/config';
import app from './app.js';

// Inyectar Temporal globalmente para que Prisma 8 pueda codificar/decodificar las fechas
const temporalGlobal = globalThis as any;

if (!temporalGlobal.Temporal) {
  temporalGlobal.Temporal = Temporal;
}

const PORT = Number(process.env['PORT'] ?? 3000);

app.listen(PORT, () => {
  console.log(`🚀 API ejecutándose en http://localhost:${PORT}`);
});