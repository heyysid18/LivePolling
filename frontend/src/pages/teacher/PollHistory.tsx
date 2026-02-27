import React from 'react';
import '../TeacherDashboard.css';

const PollHistory: React.FC = () => {

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-text">
                    <h1>Poll <span>History</span></h1>
                    <p>View your previously completed polls</p>
                </div>
            </header>
            <main className="dashboard-main">
                <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
                    Poll history fetching will go here.
                </div>
            </main>
        </div>
    );
};

export default PollHistory;
