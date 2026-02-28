import { Server, Socket } from 'socket.io';
import { PollService } from '../services/PollService';
import { handleChatEvents } from './ChatSocketHandler';

export default function setupSocket(io: Server) {

    // Track connected students
    const connectedStudents = new Map<string, { studentId: string, studentName: string }>();

    const broadcastStudentList = () => {
        // Simple mapping to prevent over-filtering that was bugging out real-time joins
        const activeStudents = Array.from(connectedStudents.values()).filter(s => s.studentName);
        console.log(`[Broadcast] Total tracked active sockets with names: ${activeStudents.length}`);

        // Deduplicate just in case of multiple tabs, keeping the latest
        const uniqueStudentsMap = new Map();
        activeStudents.forEach(s => {
            uniqueStudentsMap.set(s.studentName, s);
        });

        const payload = Array.from(uniqueStudentsMap.values());
        console.log(`[Broadcast] Emitting unique connected students array of length: ${payload.length}`, payload);
        io.emit('student_list_updated', payload);
    };

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
                // 1. Track connected student unconditionally if it's a student
                console.log(`[Socket] join_poll received from ${socket.id}`, data);
                if (data.role === 'student') {
                    const finalName = data.studentName || 'Joining...';
                    connectedStudents.set(socket.id, {
                        studentId: data.studentId || socket.id,
                        studentName: finalName
                    });
                    console.log(`[Socket] Registered student into map: ${finalName} (Active count: ${connectedStudents.size})`);
                }

                // 2. Immediately broadcast the updated connected students list to all clients
                // The broadcast function handles deduplication and emitting to everyone
                broadcastStudentList();

                const activePoll = await PollService.getActivePoll();
                if (activePoll) {
                    // Check if student is removed
                    if (data.role === 'student' && data.studentName && activePoll.removedStudents?.includes(data.studentName)) {
                        socket.emit('student_removed');
                        return; // Block join
                    }

                    socket.emit('poll_started', activePoll);
                    // Resiliently calculate remaining time from the server start time
                    socket.emit('timer_sync', PollService.getRemainingTime(activePoll));

                    // If student refreshes and had already voted, resume their state
                    if (data.studentId && data.studentName && data.role === 'student') {
                        const vote = await PollService.getStudentVote(activePoll._id.toString(), data.studentId, data.studentName);
                        if (vote) {
                            socket.emit('vote_recovered', vote.selectedOption);
                        }
                    }
                }
            } catch (err: any) {
                console.error(`[Socket] FATAL Error in join_poll:`, err);
                socket.emit('error_message', err.message || 'Error occurred joining poll');
            }
        });

        // Teacher creates poll
        socket.on('create_poll', async (data: { question: string, options: { id: string, text: string }[], duration: number, createdBy: string, sessionId: string }) => {
            console.log(`[Socket] Received create_poll:`, data);
            try {
                const poll = await PollService.createPoll(data.question, data.options, data.duration, data.createdBy, data.sessionId);
                console.log(`[Socket] createPoll successful. Emitting poll_started for poll ID: ${poll._id}`);
                io.emit('poll_started', poll);

                // Instantly push the existing student list to the teacher who just created the poll
                broadcastStudentList();
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

        // Teacher removes student from poll
        socket.on('teacher_remove_student', async (data: { pollId: string, studentName: string }) => {
            try {
                console.log(`[Socket] Received teacher_remove_student: ${data.studentName}`);
                // Only a verified teacher action should trigger this via app logic
                await PollService.removeStudent(data.pollId, data.studentName);

                // Broadcast to everyone that the student is removed so their local socket forcefully ejects
                io.emit('student_removed_broadcast', data.studentName);

                // Disconnect the student from backend tracking
                for (const [sId, student] of connectedStudents.entries()) {
                    if (student.studentName === data.studentName) {
                        io.to(sId).emit('student_removed');
                        connectedStudents.delete(sId);
                    }
                }
                broadcastStudentList();
            } catch (err: any) {
                console.error(`[Socket] Error in teacher_remove_student:`, err);
                socket.emit('error_message', err.message || 'Failed to remove student');
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

        // Initialize chat events
        handleChatEvents(io, socket);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            if (connectedStudents.has(socket.id)) {
                connectedStudents.delete(socket.id);
                broadcastStudentList();
            }
        });
    });
}
