import React, { useState } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { ChevronDown } from 'lucide-react';
import './TeacherDashboard.css';

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

const TeacherDashboard: React.FC = () => {
    const { appState, createPoll, endPoll } = useSocketContext();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false }
    ]);
    const [duration, setDuration] = useState(60);
    const [chatOpen, setChatOpen] = useState(false);

    const handleAddOption = () => {
        if (options.length >= 6) return;
        setOptions([...options, { id: Date.now().toString(), text: '', isCorrect: false }]);
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const handleCorrectChange = (id: string, isCorrect: boolean) => {
        // Find if we're trying to set something to false when it's the only true one
        // If it's a multiple choice, we might not want to enforce this, but let's assume single correct answer for now
        // or allow multiple. The UI shows 'Yes'/'No' radio buttons per option. Let's allow multiple.
        setOptions(options.map(opt => opt.id === id ? { ...opt, isCorrect } : opt));
    };

    const handleCreatePoll = () => {
        if (!question.trim()) return;
        if (options.some(opt => !opt.text.trim())) return;

        let sessionId = sessionStorage.getItem('polling_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('polling_session_id', sessionId);
        }

        // Strip out the isCorrect flag before emitting if backend doesn't support it, 
        // or keep it if we want to expand the model later.
        // For now, we'll send it as is, but assuming backend just uses 'text'
        createPoll(question, options, duration, sessionId);
        setQuestion('');
        setOptions([{ id: '1', text: '', isCorrect: true }, { id: '2', text: '', isCorrect: false }]);
    };

    const { activePoll } = appState;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="badge">
                    <StarIcon />
                    Intervue Poll
                </div>
                {!activePoll || activePoll.status === 'completed' ? (
                    <div className="header-text">
                        <h1>Let's <span>Get Started</span></h1>
                        <p>you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
                    </div>
                ) : null}
            </header>

            <main className="dashboard-main">
                {!activePoll || activePoll.status === 'completed' ? (
                    <div className="poll-creator">
                        <div className="creator-header">
                            <h3>Enter your question</h3>
                            <div className="timer-select-wrapper">
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="timer-select"
                                >
                                    <option value={30}>30 seconds</option>
                                    <option value={60}>60 seconds</option>
                                    <option value={90}>90 seconds</option>
                                    <option value={120}>120 seconds</option>
                                </select>
                                <ChevronDown className="select-icon" size={16} />
                            </div>
                        </div>

                        <div className="question-input-wrapper">
                            <textarea
                                className="question-textarea"
                                placeholder="Rahul Bajaj"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                maxLength={100}
                            />
                            <span className="char-count">{question.length}/100</span>
                        </div>

                        <div className="options-section">
                            <div className="options-column">
                                <h3>Edit Options</h3>
                                <div className="options-list">
                                    {options.map((opt, index) => (
                                        <div key={opt.id} className="option-row">
                                            <div className="option-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                className="option-input"
                                                value={opt.text}
                                                onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                    {options.length < 6 && (
                                        <button className="add-option-btn" onClick={handleAddOption}>
                                            + Add More option
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="correct-column">
                                <h3>Is it Correct?</h3>
                                <div className="correct-list">
                                    {options.map((opt) => (
                                        <div key={`correct-${opt.id}`} className="correct-row">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name={`correct-${opt.id}`}
                                                    checked={opt.isCorrect}
                                                    onChange={() => handleCorrectChange(opt.id, true)}
                                                />
                                                <span className="radio-custom"></span>
                                                Yes
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name={`correct-${opt.id}`}
                                                    checked={!opt.isCorrect}
                                                    onChange={() => handleCorrectChange(opt.id, false)}
                                                />
                                                <span className="radio-custom"></span>
                                                No
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button
                                className="btn-primary ask-btn"
                                onClick={handleCreatePoll}
                                disabled={!question.trim() || options.some(opt => !opt.text.trim())}
                            >
                                Ask Question
                            </button>
                        </div>
                    </div>
                ) : (
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
                            <button className="btn-primary" onClick={endPoll} style={{ backgroundColor: '#ff4b4b' }}>
                                End Poll Early
                            </button>
                            <button className="btn-primary new-q-btn" onClick={() => {
                                // Simulate poll end/new poll
                            }}>
                                + Ask a new question
                            </button>
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
                                    <div className="message sent">
                                        <div className="message-sender">User 2</div>
                                        <div className="message-bubble">Nothing bro..just chill!!</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
