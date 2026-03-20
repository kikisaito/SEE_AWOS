import express from 'express';
import cors from 'cors';
import crisisRoutes from './routes/crisis.routes';
import capsuleRoutes from './routes/capsule.routes';
import victoryRoutes from './routes/victory.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recommendationRoutes from './routes/recommendation.routes';
import userRoutes from './routes/user.routes'
import mediaRoutes from './routes/media.routes';
import telemetryRoutes from './routes/telemetry.routes';
import catalogRoutes from './routes/catalog.routes';
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


// Dominio: Funcionalidad Principal
app.use('/api/crisis', crisisRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/victories', victoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/catalogs', catalogRoutes);



const PORT = process.env.CORE_PORT || 3002;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(` Core Service corriendo en: http://localhost:${PORT}`);
});