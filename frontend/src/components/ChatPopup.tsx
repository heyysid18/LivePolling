import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useSocketContext } from '../contexts/SocketContext';
import { X, Send, MessageSquare } from 'lucide-react';
import './ChatPopup.css';

interface ChatPopupProps {
    pollId: string;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ pollId }) => {
    const { appState } = useSocketContext();
    const { messages, sendMessage } = useChat(pollId);

    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
            {/* Floating Action Button for opening chat */}
            {!isOpen && (
                <button className="chat-fab" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} color="white" />
                </button>
            )}

            {/* Chat Modal UI */}
            {isOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <h3>Live Q&A</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="empty-chat">No messages yet.</div>
                        ) : (
                            messages.map((msg, index) => {
                                const isSelf = appState.role === 'teacher' ? msg.senderRole === 'teacher' : msg.senderName === appState.studentName;
                                const isTeacher = msg.senderRole === 'teacher';

                                return (
                                    <div key={msg._id || index} className={`message-wrapper ${isSelf ? 'self' : 'other'} ${isTeacher && !isSelf ? 'teacher' : ''}`}>
                                        {!isSelf && (
                                            <div className="sender-name">
                                                {msg.senderName} {isTeacher ? '(Teacher)' : ''}
                                            </div>
                                        )}
                                        <div className={`message-bubble ${msg.isOptimistic ? 'optimistic' : ''}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            maxLength={200}
                        />
                        <button type="submit" disabled={!newMessage.trim()} className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatPopup;
