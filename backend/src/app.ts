import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pollRoutes from './routes/poll.routes';
import chatRoutes from './routes/chat.routes';
import { getActivePoll } from './controllers/PollController';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Determine allowed origins for CORS
const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173'
];

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile/curl) and whitelisted origins
        if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked origin: ${origin}`));
        }
    },
    credentials: true
}));
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
app.use('/api/chat', chatRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
