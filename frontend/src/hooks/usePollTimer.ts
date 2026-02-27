import { useSocketContext } from '../contexts/SocketContext';

export const usePollTimer = () => {
    const { appState } = useSocketContext();

    return {
        currentTimer: appState.currentTimer
    };
};
