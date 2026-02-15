import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.get('/summary', authenticateToken, getDashboardSummary);

export default router;