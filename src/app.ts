import express from 'express';
import userRoutes from './routes/user.routes';
import itemRoutes from './routes/item.routes';

const app = express();

app.use(express.json()); 

app.use('/api/users', userRoutes);
app.use('/api/items',  itemRoutes);

export default app;
