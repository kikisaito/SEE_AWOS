import { Router } from 'express';
import { exportDailySnapshot, getClinicalHypothesis, downloadLastCSV } from '../controllers/telemetry.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';


const router = Router();

// POST /api/telemetry/snapshot
router.post('/snapshot', authenticateToken, exportDailySnapshot);
router.get('/hypothesis', getClinicalHypothesis);
router.get('/download-csv', downloadLastCSV);

export default router;