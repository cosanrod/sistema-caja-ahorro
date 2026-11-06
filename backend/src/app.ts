import express from 'express';
import cors from 'cors';
import empleadosRouter from './routes/empleados.routes.js';
import authRouter from './routes/auth.routes.js';
import perfilRouter from './routes/perfil.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/perfil', perfilRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'API de Caja de Ahorro funcionando',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/empleados', empleadosRouter);

export default app;