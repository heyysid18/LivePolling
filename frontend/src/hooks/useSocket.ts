import { useSocketContext } from '../contexts/SocketContext';

export const useSocket = () => {
    const { socket, appState } = useSocketContext();
    return {
        socket,
        isConnected: socket?.connected || false,
        role: appState.role,
        studentName: appState.studentName,
        studentId: appState.studentId
    };
};
