import { Router } from 'express';
import { generateClinicalReport } from '../controllers/report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();


router.get('/clinical', authenticateToken, generateClinicalReport);

export default router;