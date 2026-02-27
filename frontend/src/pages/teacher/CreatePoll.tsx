import React, { useState, useEffect } from 'react';
import { useTeacherControls } from '../../hooks/useTeacherControls';
import { usePoll } from '../../hooks/usePoll';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import '../TeacherDashboard.css';

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const CreatePoll: React.FC = () => {
    const { createPoll } = useTeacherControls();
    const { activePoll } = usePoll();
    const navigate = useNavigate();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false }
    ]);
    const [duration, setDuration] = useState(60);

    useEffect(() => {
        if (activePoll && activePoll.status === 'active') {
            navigate('/teacher/live');
        }
    }, [activePoll, navigate]);

    const handleAddOption = () => {
        if (options.length >= 6) return;
        setOptions([...options, { id: Date.now().toString(), text: '', isCorrect: false }]);
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const handleCorrectChange = (id: string, isCorrect: boolean) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, isCorrect } : opt));
    };

    const handleCreatePoll = () => {
        createPoll(question, options, duration);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="badge">
                    <StarIcon />
                    Intervue Poll
                </div>
                <div className="header-text">
                    <h1>Let's <span>Get Started</span></h1>
                    <p>you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
                </div>
            </header>

            <main className="dashboard-main">
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
            </main>
        </div>
    );
};

export default CreatePoll;
