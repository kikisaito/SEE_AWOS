import express from 'express';
import cors from 'cors';
import authRoutes from './auth.routes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use(helmet());


const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15, // Límite de 150 peticiones por IP
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: "Se detectó tráfico inusual desde tu conexión. Por seguridad, espera 15 minutos." }
});
app.use(globalLimiter);

// Dominio único: Auth
app.use('/api/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(` Auth Service corriendo en: http://localhost:${PORT}`);
});