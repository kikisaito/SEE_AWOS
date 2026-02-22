import { Router } from 'express';
import { getVictoryTypes, registerVictories } from '../controllers/victory.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/types', authenticateToken, getVictoryTypes);
router.post('/', authenticateToken, registerVictories); 

export default router;