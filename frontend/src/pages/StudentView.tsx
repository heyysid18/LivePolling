import React, { useState } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import './StudentView.css';

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

const StudentView: React.FC = () => {
    const { appState, castVote, resetState } = useSocketContext();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);

    const { activePoll, hasVotedForActivePoll, studentName } = appState;

    const handleVote = () => {
        if (selectedOption && activePoll) {
            castVote(selectedOption);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="nav-brand">
                    <h2>Student: <span>{studentName}</span></h2>
                </div>
                <button className="btn-icon log-out" onClick={resetState}>
                    <LogOut size={20} /> Exit
                </button>
            </nav>

            <main className="dashboard-main student-main">
                <div className="badge-center">
                    <div className="badge">
                        <StarIcon />
                        Intervue Poll
                    </div>
                </div>

                {!activePoll ? (
                    <div className="waiting-container animate-fade-in">
                        <div className="spinner-ring"></div>
                        <h2 className="waiting-text">Wait for the teacher to ask questions..</h2>
                    </div>
                ) : activePoll.status === 'completed' ? (
                    <div className="completed-card animate-fade-in">
                        <XCircle size={60} className="icon-completed" />
                        <h3>Poll is Closed</h3>
                        <p>The timer has run out for this question.</p>
                    </div>
                ) : hasVotedForActivePoll ? (
                    <div className="success-card animate-fade-in">
                        <CheckCircle size={60} className="icon-success" />
                        <h3>Vote Submitted!</h3>
                        <p>Your response has been recorded. Waiting for the poll to end.</p>
                    </div>
                ) : (
                    <div className="student-active-poll animate-fade-in">
                        <div className="active-header">
                            <h2>Question</h2>
                        </div>

                        <div className="active-question-card">
                            <div className="student-question-text">
                                {activePoll.question}"
                            </div>

                            <div className="student-options-list">
                                {activePoll.options.map((opt, index) => (
                                    <button
                                        key={opt.id}
                                        className={`student-option-btn ${selectedOption === opt.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedOption(opt.id)}
                                    >
                                        <div className="option-pill-number">
                                            {index + 1}
                                        </div>
                                        <span className="option-text">{opt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="student-action-footer">
                            <button
                                className={`btn-primary submit-btn ${!selectedOption ? 'disabled' : ''}`}
                                onClick={handleVote}
                                disabled={!selectedOption}
                            >
                                Submit Vote
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating Chat */}
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
                            <div className="message sent">
                                <div className="message-sender">{studentName}</div>
                                <div className="message-bubble">Nothing bro..just chill!!</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentView;
