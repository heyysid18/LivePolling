import React, { useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { useSocketContext } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import '../StudentView.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const LiveResults: React.FC = () => {
    const navigate = useNavigate();
    const { appState, resetState } = useSocketContext();
    const { activePoll, hasVotedForActivePoll } = usePoll();

    useEffect(() => {
        // If teacher resets poll to null, go back to question page (which will show waiting spinner)
        if (!activePoll) {
            navigate('/student/poll');
        }
    }, [activePoll, navigate]);

    const handleExit = () => {
        resetState();
        navigate('/');
    };

    const isCompleted = activePoll?.status === 'completed';

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

                {isCompleted ? (
                    <div className="completed-card animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                        <XCircle size={60} className="icon-completed" style={{ margin: '0 auto', color: '#ff4b4b', marginBottom: '1rem' }} />
                        <h3>Poll is Closed</h3>
                        <p>The timer has run out for this question.</p>

                        <div className="results-list" style={{ marginTop: '2rem', textAlign: 'left' }}>
                            {activePoll.options.map((opt, index) => {
                                const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0);
                                const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                                return (
                                    <div key={opt.id} className="active-option-bar" style={{ background: '#25262B', margin: '0.5rem 0', borderRadius: '8px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                                        <div className="option-fill" style={{ width: `${percentage}%`, background: 'rgba(110, 86, 207, 0.2)', position: 'absolute', top: 0, left: 0, bottom: 0 }}></div>
                                        <div className="option-content" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{index + 1}. {opt.text}</span>
                                            <span>{percentage}% ({opt.votes} votes)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : hasVotedForActivePoll ? (
                    <div className="success-card animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                        <CheckCircle size={60} className="icon-success" style={{ margin: '0 auto', color: '#4caf50', marginBottom: '1rem' }} />
                        <h3>Vote Submitted!</h3>
                        <p>Your response has been recorded. Waiting for the poll to end.</p>
                    </div>
                ) : (
                    <div>Redirecting...</div>
                )}
            </main>
        </div>
    );
};

export default LiveResults;
