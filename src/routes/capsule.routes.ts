import { Router } from 'express';
import { requestUpload, createCapsule, getCapsules, getPresignedUrl } from '../controllers/capsule.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const router = Router();


router.post('/request-upload', authenticateToken, requestUpload);

router.post('/', authenticateToken, createCapsule); 

router.get('/', authenticateToken, getCapsules);

router.get('/upload-url', authenticateToken, getPresignedUrl);

export default router;