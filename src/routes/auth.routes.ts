import { Router } from 'express';
// Asegúrate de que el nombre del archivo en la carpeta controllers sea exacto
import { register, login } from '../controllers/auth.controller';

const router = Router();

// MVP Simplificado
router.post('/register', register);
router.post('/login', login);

export default router;