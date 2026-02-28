import express from 'express';
import cors from 'cors';
import authRoutes from './auth.routes';

const app = express();
app.use(cors());
app.use(express.json());

// Dominio único: Auth
app.use('/api/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(` Auth Service corriendo en: http://localhost:${PORT}`);
});