import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// MVP Simplificado
router.post('/register', register);
router.post('/login', login);
router.post('/login', login);

export default router;