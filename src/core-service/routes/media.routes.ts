import { Router } from 'express';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { getPresignedUrl } from '../controllers/media.controller';

const router = Router();

// Endpoint: GET /api/core/media/upload-url?filename=audio.mp3
router.get('/upload-url', authenticateToken, getPresignedUrl);

export default router;