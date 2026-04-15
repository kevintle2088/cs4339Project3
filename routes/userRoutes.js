import { Router } from 'express';
import { listUsers, getUser, registerUser } from '../controllers/userControllers.js';
import { requireLogin } from '../middleware/requireLogin.js';

const router = Router();

router.get('/list', requireLogin, listUsers);
router.get('/:id', requireLogin, getUser);
router.post('/', registerUser);

export default router;