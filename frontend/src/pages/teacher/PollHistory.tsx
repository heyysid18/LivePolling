import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../TeacherDashboard.css';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

interface PollHistoryItem {
    _id: string;
    question: string;
    startTime: string;
    sessionId: string;
    options: { id: string, text: string, votes: number }[];
}

interface SessionSummary {
    sessionId: string;
    totalPolls: number;
    totalVotes: number;
    aggregatedResults: { id: string, text: string, votes: number, percentage: number }[];
}

const PollHistory: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<PollHistoryItem[]>([]);
    const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const currentSessionId = sessionStorage.getItem('polling_session_id');

    useEffect(() => {
        const fetchHistoryAndSession = async () => {
            try {
                // 1. Fetch History
                const histRes = await fetch(`${SOCKET_URL}/api/polls/history`);
                const histData = await histRes.json();
                if (histData.status === 'success') {
                    setHistory(histData.data.polls);
                }

                // 2. Fetch Session Summary if we are in an active session
                if (currentSessionId) {
                    const sessRes = await fetch(`${SOCKET_URL}/api/polls/session/${currentSessionId}/results`);
                    const sessData = await sessRes.json();
                    if (sessData.status === 'success') {
                        setSessionSummary(sessData.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryAndSession();
    }, [currentSessionId]);

    return (
        <div className="dashboard-container" style={{ paddingBottom: '40px' }}>
            <header className="dashboard-header" style={{ marginBottom: '20px' }}>
                <div className="header-text">
                    <h1>Poll <span>History & Insights</span></h1>
                    <p>Review completed polls and your current session summary</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/teacher/create')}>Back to Polls</button>
            </header>
            <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* Session Summary Section */}
                {sessionSummary && sessionSummary.totalPolls > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ color: 'white', marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>Current Session Summary</h2>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', flex: 1, color: 'white' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Total Polls</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{sessionSummary.totalPolls}</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', flex: 1, color: 'white' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Total Votes Cast</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6E56CF' }}>{sessionSummary.totalVotes}</div>
                            </div>
                        </div>
                        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '12px' }}>Aggregate Option Popularity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sessionSummary.aggregatedResults.sort((a, b) => b.votes - a.votes).map((opt) => (
                                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '120px', color: '#f1f5f9', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.text}</div>
                                    <div style={{ flex: 1, background: '#334155', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${opt.percentage}%`, background: '#6E56CF', height: '100%' }}></div>
                                    </div>
                                    <div style={{ width: '40px', color: '#94a3b8', fontSize: '12px', textAlign: 'right' }}>{opt.percentage}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Individual History Section */}
                <div>
                    <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>All Completed Polls</h2>
                    {loading ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>Loading history...</div>
                    ) : history.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>No completed polls yet.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {history.map(poll => {
                                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                                return (
                                    <div key={poll._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                            {new Date(poll.startTime).toLocaleString()}
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px', lineHeight: 1.4 }}>
                                            "{poll.question}"
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                            {poll.options.map(opt => {
                                                const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                                                return (
                                                    <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: '#475569' }}>{opt.text}</span>
                                                        <span style={{ fontWeight: 600, color: '#6E56CF' }}>{pct}% ({opt.votes})</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                            Total Votes: {totalVotes}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PollHistory;
