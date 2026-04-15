import { Router } from 'express';
import { register, login, googleLogin, generate2FA, verifyAndEnable2FA, verifyLogin2FA } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/googleLogin', googleLogin);

// Rutas para 2FA
router.post('/2fa/generate', generate2FA);
router.post('/2fa/enable', verifyAndEnable2FA);
router.post('/login/verify-2fa', verifyLogin2FA);

export default router;