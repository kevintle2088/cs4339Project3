import { Router } from 'express';
import { login, logout, me } from '../controllers/adminControllers.js';
import { requireLogin } from '../middleware/requireLogin.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireLogin, me);

export default router;