import React, { useState } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const Landing: React.FC = () => {
    const { setRole } = useSocketContext();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
    const [error, setError] = useState('');

    const handleContinueToStep2 = () => {
        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        if (selectedRole === 'teacher') {
            setRole('teacher');
            navigate('/teacher/create');
        } else {
            navigate('/student/join');
        }
    };

    return (
        <div className="landing-container animate-fade-in">
            <div className="landing-content">
                <div className="badge">
                    <StarIcon />
                    Intervue Poll
                </div>

                <h1>Welcome to the <span>Live Polling System</span></h1>
                <p className="subtitle">
                    Please select the role that best describes you to begin using the live polling system
                </p>

                <div className="role-selection">
                    <div
                        className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
                        onClick={() => { setSelectedRole('student'); setError(''); }}
                    >
                        <h2>I'm a Student</h2>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                    </div>

                    <div
                        className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
                        onClick={() => { setSelectedRole('teacher'); setError(''); }}
                    >
                        <h2>I'm a Teacher</h2>
                        <p>Submit answers and view live poll results in real-time.</p>
                    </div>
                </div>

                {error && <div className="error-text select-error">{error}</div>}

                <div className="action-container">
                    <button
                        className="btn-primary"
                        onClick={handleContinueToStep2}
                        disabled={!selectedRole}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Landing;
