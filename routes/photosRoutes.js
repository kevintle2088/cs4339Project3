import { Router } from 'express';
import { createPhoto, togglePhotoLike } from '../controllers/photoControllers.js';
import { requireLogin } from '../middleware/requireLogin.js';

const router = Router();

router.post('/', requireLogin, createPhoto);
router.post('/:photoId/like', requireLogin, togglePhotoLike);

export default router;