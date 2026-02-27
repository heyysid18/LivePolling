import React, { useState, useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { usePollTimer } from '../../hooks/usePollTimer';
import { useTeacherControls } from '../../hooks/useTeacherControls';
import { useNavigate } from 'react-router-dom';
import '../TeacherDashboard.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white" />
    </svg>
);

const LiveDashboard: React.FC = () => {
    const { activePoll } = usePoll();
    const { currentTimer } = usePollTimer();
    const { endPoll } = useTeacherControls();
    const navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        if (!activePoll) {
            navigate('/teacher/create');
        }
    }, [activePoll, navigate]);

    if (!activePoll) return null;

    const isCompleted = activePoll.status === 'completed';

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="badge">
                    <StarIcon />
                    Intervue Poll Live
                </div>
                <div className="timer-badge">
                    {isCompleted ? 'Poll Completed' : `${currentTimer}s Remaining`}
                </div>
            </header>

            <main className="dashboard-main">
                <div className="active-poll-view">
                    <div className="active-header">
                        <h2>Question</h2>
                    </div>

                    <div className="active-question-card">
                        <div className="active-question-text">
                            {activePoll.question}"
                        </div>
                        <div className="active-options">
                            {activePoll.options.map((opt, index) => {
                                const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0);
                                const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                                return (
                                    <div key={opt.id} className="active-option-bar">
                                        <div className="option-fill" style={{ width: `${percentage}%` }}></div>
                                        <div className="option-content">
                                            <div className="option-number-small">{index + 1}</div>
                                            <span className="option-label-text">{opt.text}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="active-footer">
                        {isCompleted ? (
                            <button className="btn-primary new-q-btn" onClick={() => navigate('/teacher/create')}>
                                + Ask a new question
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={endPoll} style={{ backgroundColor: '#ff4b4b' }}>
                                End Poll Early
                            </button>
                        )}
                    </div>

                    <button className="floating-chat-btn" onClick={() => setChatOpen(!chatOpen)}>
                        <ChatIcon />
                    </button>

                    {chatOpen && (
                        <div className="chat-window">
                            <div className="chat-tabs">
                                <button className="chat-tab active">Chat</button>
                                <button className="chat-tab">Participants</button>
                            </div>
                            <div className="chat-messages">
                                <div className="message received">
                                    <div className="message-sender">User 1</div>
                                    <div className="message-bubble">Hey There , how can I help?</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LiveDashboard;
