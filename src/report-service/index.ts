import express from 'express';
import cors from 'cors';
import reportRoutes from './report.routes';

const app = express();
app.use(cors());
app.use(express.json());

// Dominio: Reportes
app.use('/api/reports', reportRoutes);

const PORT = process.env.REPORT_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Report Service corriendo en puerto ${PORT}`);
});