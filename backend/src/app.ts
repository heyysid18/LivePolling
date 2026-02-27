import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pollRoutes from './routes/poll.routes';
import { getActivePoll } from './controllers/PollController';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Polling Server is running' });
});

// Alias for root path active poll check
app.get('/poll/active', getActivePoll);

// API Routes
app.use('/api/polls', pollRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
