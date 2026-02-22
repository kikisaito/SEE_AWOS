import express from 'express';
import cors from 'cors';
import crisisRoutes from './routes/crisis.routes';
import capsuleRoutes from './routes/capsule.routes';
import victoryRoutes from './routes/victory.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recommendationRoutes from './routes/recommendation.routes';

const app = express();
app.use(cors());
app.use(express.json());

// Dominio: Funcionalidad Principal
app.use('/api/crisis', crisisRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/victories', victoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);

const PORT = process.env.CORE_PORT || 3002;
app.listen(PORT, () => {
  console.log(` Core Service corriendo en puerto ${PORT}`);
});