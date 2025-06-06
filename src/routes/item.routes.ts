import express from 'express';
import { addItem, searchItem } from '../controllers/item.controller';


const router = express.Router();

router.post('/add', addItem);
router.post('/search', searchItem);




export default router;