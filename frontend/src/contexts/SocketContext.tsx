import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Poll } from '../types';

// Constants
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

interface AppState {
    role: 'teacher' | 'student' | null;
    studentName: string | null;
    studentId: string | null; // unique identifier to prevent duplicate votes
    activePoll: Poll | null;
    currentTimer: number;
    hasVotedForActivePoll: boolean;
    votedOptionId: string | null;
}

interface SocketContextContextType {
    socket: Socket | null;
    appState: AppState;
    setRole: (role: 'teacher' | 'student', name?: string) => void;
    createPoll: (question: string, options: { id: string, text: string }[], timerDuration: number) => void;
    endPoll: () => void;
    castVote: (optionId: string) => void;
    resetState: () => void;
}

const SocketContext = createContext<SocketContextContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [appState, setAppState] = useState<AppState>({
        role: null,
        studentName: null,
        studentId: null,
        activePoll: null,
        currentTimer: 0,
        hasVotedForActivePoll: false,
        votedOptionId: null,
    });

    useEffect(() => {
        // 1. Initialize Student Identity (for resilience/refresh recovery)
        let sId = sessionStorage.getItem('polling_student_id');
        const sName = sessionStorage.getItem('polling_student_name');
        const sRole = sessionStorage.getItem('polling_role') as 'teacher' | 'student' | null;

        if (!sId && sRole === 'student') {
            sId = crypto.randomUUID();
            sessionStorage.setItem('polling_student_id', sId);
        }

        setAppState(prev => ({
            ...prev,
            role: sRole,
            studentName: sName,
            studentId: sId,
        }));

        // 2. Initialize Socket and reconnect behavior
        const newSocket = io(SOCKET_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        // Initial Join explicitly passes identity for recovery
        newSocket.on('connect', () => {
            newSocket.emit('join_poll', { studentId: sId, role: sRole });
        });

        newSocket.on('poll_started', (poll: Poll) => {
            setAppState(prev => ({
                ...prev,
                activePoll: poll,
                hasVotedForActivePoll: false, // reset vote status on new poll
                votedOptionId: null
            }));
        });

        newSocket.on('poll_update', (updatedPoll: Poll) => {
            setAppState(prev => ({ ...prev, activePoll: updatedPoll }));
        });

        newSocket.on('poll_results', (completedPoll: Poll) => {
            setAppState(prev => ({ ...prev, activePoll: completedPoll }));
        });

        newSocket.on('timer_sync', (time: number) => {
            setAppState(prev => ({ ...prev, currentTimer: time }));
        });

        newSocket.on('vote_successful', (optionId: string) => {
            setAppState(prev => ({ ...prev, hasVotedForActivePoll: true, votedOptionId: optionId }));
            toast.success('Vote submitted successfully!');
        });

        // Recovery event from server if student already voted in the active poll
        newSocket.on('vote_recovered', (optionId: string) => {
            setAppState(prev => ({ ...prev, hasVotedForActivePoll: true, votedOptionId: optionId }));
            toast.success('Restored your existing vote.');
        });

        newSocket.on('error_message', (msg: string) => {
            console.error('Socket error received:', msg);
            toast.error(msg);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const setRole = (role: 'teacher' | 'student', name?: string) => {
        sessionStorage.setItem('polling_role', role);
        let sId = sessionStorage.getItem('polling_student_id');

        if (role === 'student') {
            if (!sId) {
                sId = crypto.randomUUID();
                sessionStorage.setItem('polling_student_id', sId);
            }
            if (name) {
                sessionStorage.setItem('polling_student_name', name);
            }
        }

        setAppState(prev => ({
            ...prev,
            role,
            studentName: name || null,
            studentId: sId || null,
        }));

        // Rejoin to sync state for new role
        if (socket) {
            socket.emit('join_poll', { studentId: sId, role });
        }
    };

    const createPoll = (question: string, options: { id: string, text: string }[], duration: number) => {
        if (socket && appState.role === 'teacher') {
            socket.emit('create_poll', {
                question,
                options,
                duration,
                createdBy: appState.studentName || 'Teacher' // Use stored name or default
            });
        }
    };

    const endPoll = () => {
        if (socket && appState.role === 'teacher' && appState.activePoll) {
            socket.emit('end_poll', { pollId: appState.activePoll._id });
        }
    };

    const castVote = (optionId: string) => {
        if (socket && appState.role === 'student' && appState.activePoll) {
            // Optimistic lock
            if (appState.hasVotedForActivePoll) return;

            socket.emit('submit_vote', {
                pollId: appState.activePoll._id,
                studentId: appState.studentId,
                studentName: appState.studentName,
                selectedOption: optionId
            });
        }
    };

    const resetState = () => {
        sessionStorage.clear();
        setAppState({
            role: null,
            studentName: null,
            studentId: null,
            activePoll: null,
            currentTimer: 0,
            hasVotedForActivePoll: false,
            votedOptionId: null,
        });
        // Let socket know we're basically resetting context (optional, but good practice if needed)
    };

    return (
        <SocketContext.Provider value={{ socket, appState, setRole, createPoll, endPoll, castVote, resetState }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};
