import express from 'express';
import { addItem, searchItem, getLostItems } from '../controllers/item.controller';
import { verifyToken } from '../middleware/authMiddleware';
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.post('/add', verifyToken, upload.single('image') , addItem);
router.post('/search',verifyToken, searchItem);
router.get('/view', getLostItems);




export default router;