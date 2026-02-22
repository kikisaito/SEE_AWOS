import { Router } from 'express';
import { generateClinicalReport } from './report.controller';
import { authenticateToken } from '../shared/middlewares/auth.middleware';

const router = Router();


router.get('/clinical', authenticateToken, generateClinicalReport);

export default router;