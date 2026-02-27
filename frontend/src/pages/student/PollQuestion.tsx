import React, { useState, useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { usePollTimer } from '../../hooks/usePollTimer';
import { useSocketContext } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import '../StudentView.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const PollQuestion: React.FC = () => {
    const navigate = useNavigate();
    const { appState, resetState } = useSocketContext();
    const { activePoll, castVote, hasVotedForActivePoll } = usePoll();
    const { currentTimer } = usePollTimer();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // If poll completes, or user has voted, navigate them to relative status page
    useEffect(() => {
        if (activePoll?.status === 'completed' || hasVotedForActivePoll) {
            navigate('/student/results');
        }
    }, [activePoll?.status, hasVotedForActivePoll, navigate]);

    const handleVote = () => {
        if (selectedOption && activePoll) {
            castVote(selectedOption);
            // Optimistic UI freeze handled inside context via toast and hasVoted
        }
    };

    const handleExit = () => {
        resetState();
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="nav-brand">
                    <h2>Student: <span>{appState.studentName}</span></h2>
                </div>
                <button className="btn-icon log-out" onClick={handleExit}>
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
                ) : (
                    <div className="student-active-poll animate-fade-in">
                        <div className="active-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Question</h2>
                            {/* THIS SPECIFICALLY FIXES THE "STUDENT CANNOT SEE TIME" ISSUE! */}
                            <div className="timer-badge" style={{ color: 'white', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                ⏱️ {currentTimer}s
                            </div>
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
            </main>
        </div>
    );
};

export default PollQuestion;
