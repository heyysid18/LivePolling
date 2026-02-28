import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const pollId = req.params.pollId as string;
        if (!pollId) throw new Error('Poll ID is required');
        const messages = await ChatService.getChatHistory(pollId);

        res.status(200).json({
            status: 'success',
            data: {
                messages
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching chat history'
        });
    }
};
