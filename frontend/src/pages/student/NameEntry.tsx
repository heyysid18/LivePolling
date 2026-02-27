import React, { useState } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const NameEntry: React.FC = () => {
    const { setRole } = useSocketContext();
    const navigate = useNavigate();
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState('');

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentName.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        setRole('student', studentName.trim());
        navigate('/student/poll');
    };

    return (
        <div className="landing-container animate-fade-in">
            <div className="landing-content">
                <div className="badge">
                    <StarIcon />
                    Intervue Poll
                </div>

                <h1>Let's <span>Get Started</span></h1>
                <p className="subtitle">
                    If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
                </p>

                <form onSubmit={handleStudentSubmit} className="name-form">
                    <div className="input-group">
                        <label htmlFor="studentName">Enter your Name</label>
                        <input
                            id="studentName"
                            type="text"
                            placeholder="Rahul Bajaj"
                            value={studentName}
                            onChange={(e) => {
                                setStudentName(e.target.value);
                                setError('');
                            }}
                            className={`input-field ${error ? 'error' : ''}`}
                            maxLength={40}
                            autoFocus
                        />
                        {error && <span className="error-text">{error}</span>}
                    </div>
                    <button type="submit" className="btn-primary">Continue</button>
                </form>
            </div>
        </div>
    );
};

export default NameEntry;
