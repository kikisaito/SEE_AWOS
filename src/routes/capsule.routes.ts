import { Router } from 'express';
import { requestUpload } from '../controllers/capsule.controller';

const router = Router();

router.post('/request-upload', requestUpload);

export default router;