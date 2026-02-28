import { Router } from 'express';
import { getChatHistory } from '../controllers/ChatController';

const router = Router();

// GET /api/chat/:pollId
router.get('/:pollId', getChatHistory);

export default router;
