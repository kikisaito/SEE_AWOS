import { Router } from 'express';
import { getPresignedUrl } from '../controllers/s3.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';

const router = Router();

// GET /api/s3/presigned-url
router.get('/presigned-url', authenticateToken, getPresignedUrl);

export default router;