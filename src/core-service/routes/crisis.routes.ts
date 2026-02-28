import { Router } from 'express';
import { startCrisis, updateCrisis, updateCrisisReflection, updateCrisisProgress, saveCrisisReflection } from '../controllers/crisis.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';


const router = Router();


router.post('/', authenticateToken, startCrisis);
  //PUT /api/crisis/:id/end
router.put('/:id/end', authenticateToken, updateCrisis);

router.put('/:id/reflection', authenticateToken, updateCrisisReflection);

router.patch('/:id/progress', authenticateToken, updateCrisisProgress);

router.put('/:id/reflection', authenticateToken, saveCrisisReflection);

export default router;