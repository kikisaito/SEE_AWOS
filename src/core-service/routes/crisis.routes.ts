import { Router } from 'express';
import { startCrisis, updateCrisis, updateCrisisReflection } from '../controllers/crisis.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';


const router = Router();


router.post('/start', authenticateToken, startCrisis);

                                                        //PUT /api/crisis/:id/end
router.put('/:id/end', authenticateToken, updateCrisis);


router.put('/:id/reflection', authenticateToken, updateCrisisReflection);

export default router;