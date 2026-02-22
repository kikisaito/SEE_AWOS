import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount } from '../controllers/user.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// GET /api/users/profile
router.get('/profile', getProfile);

// PUT /api/users/profile
router.put('/profile', updateProfile);

// DELETE /api/users/profile
router.delete('/profile', deleteAccount);

export default router;