import { useSocketContext } from '../contexts/SocketContext';

export const usePoll = () => {
    const { appState, castVote } = useSocketContext();

    return {
        activePoll: appState.activePoll,
        hasVotedForActivePoll: appState.hasVotedForActivePoll,
        votedOptionId: appState.votedOptionId,
        castVote
    };
};
