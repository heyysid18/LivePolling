import { useState, useEffect, useCallback } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

export interface ChatMessage {
    _id?: string;
    pollId: string;
    senderName: string;
    senderRole: 'teacher' | 'student';
    message: string;
    createdAt?: string | Date;
    isOptimistic?: boolean; // For tracking locally added msgs
}

export const useChat = (pollId: string) => {
    const { socket, appState } = useSocketContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (!socket || !pollId) return;

        // When initializing, request history
        socket.emit('fetch_chat_history', { pollId });

        const handleChatHistory = (history: ChatMessage[]) => {
            setMessages(history);
        };

        const handleNewMessage = (newMsg: ChatMessage) => {
            setMessages(prev => {
                // If we optimistic-ly added it, we might want to replace it,
                // but for simplicity we'll just append and deduplicate slightly if needed.
                // Best simple approach: filter out optimistic versions of our own exact msg,
                // or simply don't do complex deduping and just rely on quick socket roundtrips.

                // Remove optimistic messages that match the incoming one's text and sender
                const filtered = prev.filter(m => !(m.isOptimistic && m.message === newMsg.message && m.senderName === newMsg.senderName));

                // Avoid storing duplicate actual messages (if socket fires twice)
                if (newMsg._id && filtered.some(m => m._id === newMsg._id)) {
                    return filtered;
                }

                return [...filtered, newMsg];
            });
        };

        socket.on('chat_history', handleChatHistory);
        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('chat_history', handleChatHistory);
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, pollId]);

    const sendMessage = useCallback((text: string) => {
        if (!socket || !appState.role) {
            toast.error("Not connected");
            return;
        }

        const isTeacher = appState.role === 'teacher';
        if (!isTeacher && !appState.studentName) {
            toast.error("Missing identity");
            return;
        }

        const senderName = isTeacher ? 'Teacher' : appState.studentName!;

        const optimisticMsg: ChatMessage = {
            pollId,
            senderName,
            senderRole: appState.role,
            message: text,
            createdAt: new Date(),
            isOptimistic: true
        };

        // UI Optimistic update
        setMessages(prev => [...prev, optimisticMsg]);

        // Emit to server
        socket.emit('send_message', {
            pollId,
            senderName,
            senderRole: appState.role,
            message: text
        });
    }, [socket, pollId, appState.role, appState.studentName]);

    // Computed visibility rule:
    // Everyone sees all messages as per the new requirements.
    const visibleMessages = messages;

    return {
        messages: visibleMessages,
        sendMessage
    };
};
