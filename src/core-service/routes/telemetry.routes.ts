import { Router } from 'express';
import { exportDailySnapshot, getClinicalHypothesis } from '../controllers/telemetry.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';


const router = Router();

// POST /api/telemetry/snapshot
router.post('/snapshot', authenticateToken, exportDailySnapshot);
router.get('/hypothesis', getClinicalHypothesis);

export default router;