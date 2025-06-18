import express from 'express';
import { addItem, searchItem, getLostItems, deleteItem, getMyItems, getNearbyItems, getNearbyLostItems  } from '../controllers/item.controller';
import { verifyToken } from '../middleware/authMiddleware';
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.post('/add', verifyToken, upload.single('image') , addItem);
router.post('/search',verifyToken, searchItem);
router.get('/view', getLostItems);
router.delete('/:id', verifyToken, deleteItem);
router.get('/my', verifyToken, getMyItems);
router.get('/nearby', verifyToken,getNearbyItems);
router.get('/nearby-lost', verifyToken, getNearbyLostItems);




export default router;