import express from 'express';
import cors from 'cors';
import reportRoutes from './report.routes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use(helmet());


const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 150, // Límite de 150 peticiones por IP
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: "Se detectó tráfico inusual desde tu conexión. Por seguridad, espera 15 minutos." }
});
app.use(globalLimiter);


// Dominio: Reportes
app.use('/api/reports', reportRoutes);

const PORT = process.env.REPORT_PORT || 3003;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(` Report Service corriendo en: http://localhost:${PORT}`);
});