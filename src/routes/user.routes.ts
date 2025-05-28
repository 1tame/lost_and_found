// src/routes/user.routes.ts
import express from 'express';
import { createUser, loginUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/add', createUser);
router.post('/login', loginUser);

export default router;