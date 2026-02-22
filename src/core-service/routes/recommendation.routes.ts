import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getRecommendations);

export default router;