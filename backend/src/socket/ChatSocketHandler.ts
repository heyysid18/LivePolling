import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/ChatService';
import { PollService } from '../services/PollService';

export const handleChatEvents = (io: Server, socket: Socket) => {
    // 1. Send Message
    socket.on('send_message', async (data: { pollId?: string, senderName: string, senderRole: 'teacher' | 'student', message: string }) => {
        try {
            // Default to 'global' room if no specific pollId is provided
            const targetRoom = data.pollId || 'global';

            // Save the message persistently
            const savedMessage = await ChatService.saveMessage(targetRoom, data.senderName, data.senderRole, data.message);

            // Broadcast the message immediately
            io.emit('new_message', savedMessage);

        } catch (error: any) {
            console.error('[Socket/Chat] Error sending message:', error);
            socket.emit('error_message', error.message || 'Failed to send message');
        }
    });

    // 2. Fetch Chat History
    socket.on('fetch_chat_history', async (data?: { pollId?: string }) => {
        try {
            const targetRoom = data?.pollId || 'global';
            const history = await ChatService.getChatHistory(targetRoom);
            socket.emit('chat_history', history);
        } catch (error: any) {
            console.error('[Socket/Chat] Error fetching history:', error);
            socket.emit('error_message', 'Failed to fetch chat history');
        }
    });
};
