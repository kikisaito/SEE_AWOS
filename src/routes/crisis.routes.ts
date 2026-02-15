import { Router } from 'express';
import { startCrisis, updateCrisis } from '../controllers/crisis.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const router = Router();


router.post('/start', authenticateToken, startCrisis);

                                                        //PUT /api/crisis/:id/end
router.put('/:id/end', authenticateToken, updateCrisis);

export default router;