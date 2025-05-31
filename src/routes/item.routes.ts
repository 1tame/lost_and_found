import express from 'express';
import { addItem } from '../controllers/item.controller';


const router = express.Router();

router.post('/add', addItem);




export default router;