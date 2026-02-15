import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getRecommendations);

export default router;