import { useSocketContext } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

export const useTeacherControls = () => {
    const { createPoll, endPoll, appState } = useSocketContext();

    const handleCreatePoll = (question: string, options: { id: string, text: string }[], duration: number) => {
        if (!question.trim()) {
            toast.error('Question cannot be empty');
            return;
        }
        if (options.some(opt => !opt.text.trim())) {
            toast.error('All options must have text');
            return;
        }

        let sessionId = sessionStorage.getItem('polling_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('polling_session_id', sessionId);
        }

        createPoll(question, options, duration, sessionId);
    };

    return {
        createPoll: handleCreatePoll,
        endPoll,
        isPollActive: appState.activePoll?.status === 'active'
    };
};
