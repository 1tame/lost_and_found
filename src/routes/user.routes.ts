// src/routes/user.routes.ts
import express from 'express';
import { createUser, loginUser,  forgotPassword, resetPassword } from '../controllers/user.controller';

const router = express.Router();

router.post('/add', createUser);
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;