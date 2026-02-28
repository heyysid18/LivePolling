import Chat, { IChat } from '../models/Chat';

class ChatServiceClass {
    /**
     * Saves a new chat message to the DB.
     */
    async saveMessage(pollId: string, senderName: string, senderRole: 'teacher' | 'student', message: string): Promise<IChat> {
        try {
            const newChat = new Chat({
                pollId,
                senderName,
                senderRole,
                message,
            });
            return await newChat.save();
        } catch (error) {
            console.error('[ChatService] Error saving message:', error);
            throw new Error('Failed to save message');
        }
    }

    /**
     * Fetches chat history for a specific poll.
     */
    async getChatHistory(pollId: string): Promise<IChat[]> {
        try {
            // Sort by creation date ascending so newest messages are at the bottom
            return await Chat.find({ pollId }).sort({ createdAt: 1 }).exec();
        } catch (error) {
            console.error(`[ChatService] Error fetching chat history for poll ${pollId}:`, error);
            throw new Error('Failed to fetch chat history');
        }
    }
}

export const ChatService = new ChatServiceClass();
