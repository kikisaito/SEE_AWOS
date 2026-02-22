import { Router } from 'express';
import { registerVictories } from '../controllers/victory.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.post('/', authenticateToken, registerVictories); 

export default router;