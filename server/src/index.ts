import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import searchRoutes from './routes/search';
import favoriteRoutes from './routes/favorites';
import imageRoutes from './routes/images';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
