import { Router } from 'express';
import { addComment } from '../controllers/photoControllers.js';
import { requireLogin } from '../middleware/requireLogin.js';

const router = Router();

router.post('/:photoId', requireLogin, addComment);

export default router;
