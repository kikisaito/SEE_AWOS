import { Router } from 'express';
import { getDashboardSummary, getPendingReflections } from '../controllers/dashboard.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/summary', authenticateToken, getDashboardSummary);
router.get('/pending-reflections', authenticateToken, getPendingReflections);

export default router;