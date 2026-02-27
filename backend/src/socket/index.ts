import { Server, Socket } from 'socket.io';
import { PollService } from '../services/PollService';

export default function setupSocket(io: Server) {

    // Subscribe to PollService events to broadcast to all clients
    PollService.on('timer_sync', (remainingTime: number) => {
        io.emit('timer_sync', remainingTime);
    });

    PollService.on('poll_results', (completedPoll) => {
        io.emit('poll_results', completedPoll);
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Student/Teacher joins or reconnects
        socket.on('join_poll', async (data: { studentId?: string, studentName?: string, role: string }) => {
            try {
                const activePoll = await PollService.getActivePoll();
                if (activePoll) {
                    socket.emit('poll_started', activePoll);
                    // Resiliently calculate remaining time from the server start time
                    socket.emit('timer_sync', PollService.getRemainingTime(activePoll));

                    // If student refreshes and had already voted, resume their state
                    if (data.studentId && data.role === 'student') {
                        const vote = await PollService.getStudentVote(activePoll._id.toString(), data.studentId, data.studentName);
                        if (vote) {
                            socket.emit('vote_recovered', vote.selectedOption);
                        }
                    }
                }
            } catch (err: any) {
                socket.emit('error_message', err.message || 'Error occurred joining poll');
            }
        });

        // Teacher creates poll
        socket.on('create_poll', async (data: { question: string, options: { id: string, text: string }[], duration: number, createdBy: string }) => {
            console.log(`[Socket] Received create_poll:`, data);
            try {
                const poll = await PollService.createPoll(data.question, data.options, data.duration, data.createdBy);
                console.log(`[Socket] createPoll successful. Emitting poll_started for poll ID: ${poll._id}`);
                io.emit('poll_started', poll);
            } catch (err: any) {
                console.error(`[Socket] Error in create_poll:`, err);
                socket.emit('error_message', err.message || 'Failed to create poll');
            }
        });

        // Teacher ends poll early
        socket.on('end_poll', async (data: { pollId: string }) => {
            try {
                const poll = await PollService.endPoll(data.pollId);
                if (poll) {
                    io.emit('poll_results', poll);
                }
            } catch (err: any) {
                socket.emit('error_message', err.message || 'Failed to end poll early');
            }
        });

        // Student submits vote
        socket.on('submit_vote', async (data: { pollId: string, studentId: string, studentName: string, selectedOption: string }) => {
            try {
                const updatedPoll = await PollService.castVote(data.pollId, data.studentId, data.studentName, data.selectedOption);
                // Broadcast updated totals
                io.emit('poll_update', updatedPoll);
                socket.emit('vote_successful', data.selectedOption);
            } catch (err: any) {
                // Return error to this specific socket (e.g. "already voted" or "poll ended")
                socket.emit('error_message', err.message || 'Failed to vote');
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}
