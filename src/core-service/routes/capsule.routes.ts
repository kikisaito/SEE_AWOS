import { Router } from 'express';
import { requestUpload, createCapsule, getCapsules, getPresignedUrl, updateCapsule, deleteCapsule } from '../controllers/capsule.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';


const router = Router();


router.post('/request-upload', authenticateToken, requestUpload);

router.post('/', authenticateToken, createCapsule); 

router.get('/', authenticateToken, getCapsules);

router.get('/upload-url', authenticateToken, getPresignedUrl);

router.patch('/:id', authenticateToken, updateCapsule);


router.delete('/:id', authenticateToken, deleteCapsule);

export default router;