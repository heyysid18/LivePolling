import React, { useState, useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { usePollTimer } from '../../hooks/usePollTimer';
import { useTeacherControls } from '../../hooks/useTeacherControls';
import { useSocketContext } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserX, X } from 'lucide-react';
import '../TeacherDashboard.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);



const LiveDashboard: React.FC = () => {
    const { appState, removeStudent } = useSocketContext();
    const { activePoll } = usePoll();
    const { currentTimer } = usePollTimer();
    const { endPoll } = useTeacherControls();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
    const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

    const handleConfirmRemove = () => {
        if (studentToRemove && activePoll) {
            removeStudent(activePoll._id, studentToRemove);
            setStudentToRemove(null);
        }
    };

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

                    <button className="floating-chat-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#6E56CF', display: 'flex', gap: '8px', alignItems: 'center', padding: '0 20px', borderRadius: '24px', width: 'auto' }}>
                        <Users color="white" size={20} />
                        <span style={{ color: 'white', fontWeight: 600 }}>{appState.connectedStudents.length} Students</span>
                    </button>

                    {sidebarOpen && (
                        <div className="chat-window" style={{ width: '350px' }}>
                            <div className="chat-tabs">
                                <button className="chat-tab active" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    Live Participants ({appState.connectedStudents.length})
                                </button>
                            </div>
                            <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {appState.connectedStudents.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No students connected</div>
                                ) : (
                                    appState.connectedStudents.map(student => (
                                        <div key={student.studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <span style={{ fontWeight: 500, color: '#334155' }}>{student.studentName}</span>
                                            <button
                                                onClick={() => setStudentToRemove(student.studentName)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                                                title={`Remove ${student.studentName}`}
                                            >
                                                <UserX size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Remove Student Confirmation Modal */}
                {studentToRemove && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Remove Student</h3>
                                <button onClick={() => setStudentToRemove(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                            </div>
                            <p style={{ color: '#475569', marginBottom: '24px', lineHeight: 1.5 }}>
                                Are you sure you want to remove <strong>{studentToRemove}</strong> from the poll? They will be immediately disconnected and blocked from rejoining.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setStudentToRemove(null)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                                <button onClick={handleConfirmRemove} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', fontWeight: 600, cursor: 'pointer', color: 'white' }}>Yes, Remove</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LiveDashboard;
