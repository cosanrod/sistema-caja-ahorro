import express from 'express';
import cors from 'cors';
import empleadosRouter from './routes/empleados.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'API de Caja de Ahorro funcionando',
  });
});

app.use('/api/empleados', empleadosRouter);

export default app;