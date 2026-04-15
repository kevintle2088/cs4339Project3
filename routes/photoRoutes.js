import { Router } from 'express';
import { getPhotosOfUser } from '../controllers/photoControllers.js';
import { requireLogin } from '../middleware/requireLogin.js';

const router = Router();

router.get('/:id', requireLogin, getPhotosOfUser);

export default router;