import express from 'express';
import userRoutes from './routes/user.routes';
import itemRoutes from './routes/item.routes';
import claimRoutes from './routes/claim.routes';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json()); 

app.use('/api/users', userRoutes);
app.use('/api/items',  itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/uploads', express.static('uploads'));


export default app;
