import { Router } from 'express';
import { startCrisis } from '../controllers/crisis.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();


router.post('/start', authenticateToken, startCrisis);

export default router;