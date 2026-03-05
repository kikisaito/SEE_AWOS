import { Router } from 'express';
import { 
  startCrisis, 
  updateCrisis, 
  updateCrisisProgress, 
  saveCrisisReflection 
} from '../controllers/crisis.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, startCrisis);
router.put('/:id/end', authenticateToken, updateCrisis);
router.patch('/:id/progress', authenticateToken, updateCrisisProgress);
router.put('/:id/reflection', authenticateToken, saveCrisisReflection);

export default router;