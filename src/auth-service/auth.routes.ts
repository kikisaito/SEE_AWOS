import { Router } from 'express';
import { register, login, googleLogin } from './auth.controller';

const router = Router();

// MVP Simplificado
router.post('/register', register);
router.post('/login', login);
router.post('/login', login); // Ruta duplicada para login, se puede eliminar o modificar según sea necesario, aun no borro nada pq sigo revisando los demas archivos al final hare limpiado de todo
router.post('/googleLogin', googleLogin);
export default router;