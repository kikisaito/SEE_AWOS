import { Router } from 'express';
import { requestUpload, createCapsule } from '../controllers/capsule.controller';

const router = Router();


router.post('/request-upload', requestUpload);


router.post('/', createCapsule); 

export default router;