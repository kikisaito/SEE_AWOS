import express from 'express';
import dotenv from 'dotenv';

// Importación de rutas
import authRoutes from './routes/auth.routes';
import capsuleRoutes from './routes/capsule.routes';
import crisisRoutes from './routes/crisis.routes';
import victoryRoutes from './routes/victory.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recommendationRoutes from './routes/recommendation.routes';
import reportRoutes from './routes/report.routes';



dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// --- ZONA DE RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/victories', victoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => {
  res.send('Servidor AWOS funcionando ');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor AWOS corriendo en: http://localhost:${PORT}`);
});

export default app;