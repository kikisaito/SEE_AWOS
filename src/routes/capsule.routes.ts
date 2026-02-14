import { Router } from 'express';
import { requestUpload, createCapsule } from '../controllers/capsule.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const router = Router();


router.post('/request-upload', authenticateToken, requestUpload);


router.post('/', authenticateToken, createCapsule); 

export default router;