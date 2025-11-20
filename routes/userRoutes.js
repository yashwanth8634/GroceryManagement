import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser); // POST /api/users
router.post('/login', loginUser); // POST /api/users/login
router.post('/logout', logoutUser); // POST /api/users/logout

export default router;