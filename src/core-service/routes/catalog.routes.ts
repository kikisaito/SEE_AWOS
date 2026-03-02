import { Router } from 'express';
import { getEmotions, getEvaluations } from '../controllers/catalog.controller';

const router = Router();


router.get('/emotions', getEmotions);
router.get('/evaluations', getEvaluations);

export default router;