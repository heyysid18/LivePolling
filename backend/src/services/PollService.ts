import Poll, { IPoll, IPollOption } from '../models/Poll';
import Vote, { IVote } from '../models/Vote';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

class PollServiceClass extends EventEmitter {
    private timerInterval: NodeJS.Timeout | null = null;
    private currentTimer: number = 0;
    private activePollId: string | null = null;

    constructor() {
        super();
        this.resumeActivePolls();
    }

    /**
     * Recovers any active poll from the DB on server restart and resumes its timer.
     */
    private async resumeActivePolls() {
        try {
            const activePoll = await Poll.findOne({ status: 'active' });
            if (activePoll) {
                const remaining = this.getRemainingTime(activePoll);
                if (remaining > 0) {
                    this.activePollId = activePoll._id.toString();
                    this.startTimer(remaining, this.activePollId);
                    console.log(`[PollService] Resumed timer for active poll ${this.activePollId} (${remaining}s remaining)`);
                } else {
                    // Time already expired while server was offline
                    await this.completePoll(activePoll._id.toString());
                    console.log(`[PollService] Completed expired active poll ${activePoll._id} on boot`);
                }
            }
        } catch (err) {
            console.error('Failed to resume active polls on startup', err);
        }
    }

    /**
     * Creates a new poll. Automatically completes any existing active poll.
     */
    async createPoll(question: string, options: { id: string, text: string }[], duration: number, createdBy: string, sessionId: string): Promise<IPoll> {
        // End any currently active polls in DB
        await Poll.updateMany({ status: 'active' }, { status: 'completed' });
        this.stopTimer(); // Clear existing in-memory timer

        const newPoll = new Poll({
            question,
            options: options.map(opt => ({ ...opt, votes: 0 })),
            duration,
            createdBy,
            status: 'active',
            removedStudents: [],
            sessionId
        });

        const savedPoll = await newPoll.save();

        this.activePollId = savedPoll._id.toString();
        this.startTimer(duration, this.activePollId);

        return savedPoll;
    }

    /**
     * Retrieves the currently active poll, if any.
     */
    async getActivePoll(): Promise<IPoll | null> {
        console.log(`[PollService] getActivePoll: Requesting DB...`);
        try {
            const poll = await Poll.findOne({ status: 'active' });
            console.log(`[PollService] getActivePoll: DB responded successfully. (Found: ${!!poll})`);
            return poll;
        } catch (err: any) {
            console.error(`[PollService] getActivePoll DB ERROR:`, err);
            throw err;
        }
    }

    /**
     * Completes a specific poll.
     */
    async completePoll(pollId: string): Promise<IPoll | null> {
        const completedPoll = await Poll.findByIdAndUpdate(pollId, { status: 'completed' }, { new: true });
        if (this.activePollId === pollId) {
            this.stopTimer();
            this.activePollId = null;
        }
        return completedPoll;
    }

    /**
     * Forces a poll to end early (e.g. triggered by teacher).
     */
    async endPoll(pollId: string): Promise<IPoll | null> {
        this.stopTimer();
        const poll = await this.completePoll(pollId);
        if (poll) {
            this.emit('poll_results', poll);
        }
        return poll;
    }

    /**
     * Records a vote for a student. Returns updated poll or throws error if duplicate.
     */
    async castVote(pollId: string, studentId: string, studentName: string, selectedOption: string): Promise<IPoll> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Check if poll exists and is active
            const poll = await Poll.findById(pollId).session(session);
            if (!poll) throw new Error('Poll not found');
            if (poll.status !== 'active') throw new Error('Poll is no longer active');

            // 1.5 Prevent removed students from voting
            if (poll.removedStudents && poll.removedStudents.includes(studentName)) {
                throw new Error('You have been removed by the teacher and cannot vote in this poll.');
            }

            // 2. Prevent duplicate votes via DB read barrier
            const existingVote = await Vote.findOne({ pollId, studentName }).session(session);
            if (existingVote) throw new Error('You have already voted on this poll');

            // 3. Record the vote
            // If API spam reaches this point bypassing the findOne read due to parallel execution, 
            // the unique compound index on (pollId + studentName) will instantly block this save with code 11000
            const vote = new Vote({ pollId, studentId, studentName, selectedOption });
            await vote.save({ session });

            // 4. Increment the option vote count atomically
            const updatedPoll = await Poll.findOneAndUpdate(
                { _id: pollId, 'options.id': selectedOption },
                { $inc: { 'options.$.votes': 1 } },
                { new: true, session }
            );

            if (!updatedPoll) throw new Error('Failed to update poll totals');

            await session.commitTransaction();
            return updatedPoll;
        } catch (error: any) {
            await session.abortTransaction();
            // True atomic protection against race conditions / parallel API spam
            if (error.code === 11000) {
                throw new Error('You have already voted on this poll');
            }
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Gets specific student's vote for a poll
     */
    async getStudentVote(pollId: string, studentId: string, studentName?: string): Promise<IVote | null> {
        if (!studentName) {
            return await Vote.findOne({ pollId, studentId });
        }
        return await Vote.findOne({
            pollId,
            $or: [{ studentId }, { studentName }]
        });
    }

    /**
     * Removes a student from the active poll, preventing them from voting further.
     */
    async removeStudent(pollId: string, studentName: string): Promise<IPoll | null> {
        return await Poll.findByIdAndUpdate(
            pollId,
            { $addToSet: { removedStudents: studentName } },
            { new: true }
        );
    }

    /**
     * Calculates and returns results for a poll
     */
    async calculateResults(pollId: string): Promise<IPollOption[]> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        return poll.options;
    }

    /**
     * Fetches all completed polls representing history (newest first).
     */
    async getPollHistory(): Promise<IPoll[]> {
        // Find all completed polls, sort by most recent startTime
        return await Poll.find({ status: 'completed' }).sort({ startTime: -1 });
    }

    /**
     * Aggregates sum of all poll results per session.
     */
    async getSessionResults(sessionId: string) {
        // Find all completed polls for this session
        const polls = await Poll.find({ sessionId, status: 'completed' });

        let totalVotesGlobal = 0;
        const aggregateOptions = new Map<string, { text: string, votes: number }>();

        polls.forEach(poll => {
            poll.options.forEach(opt => {
                totalVotesGlobal += opt.votes;
                const existing = aggregateOptions.get(opt.id);
                if (existing) {
                    existing.votes += opt.votes;
                } else {
                    aggregateOptions.set(opt.id, { text: opt.text, votes: opt.votes });
                }
            });
        });

        const aggregatedArray = Array.from(aggregateOptions.entries()).map(([id, data]) => ({
            id,
            text: data.text,
            votes: data.votes,
            percentage: totalVotesGlobal === 0 ? 0 : Math.round((data.votes / totalVotesGlobal) * 100)
        }));

        return {
            sessionId,
            totalPolls: polls.length,
            totalVotes: totalVotesGlobal,
            aggregatedResults: aggregatedArray
        };
    }

    /**
     * Calculates the exact remaining time based on startTime.
     */
    getRemainingTime(poll: IPoll): number {
        const elapsedSeconds = Math.floor((Date.now() - new Date(poll.startTime).getTime()) / 1000);
        return Math.max(0, poll.duration - elapsedSeconds);
    }

    // --- Private Timer Logic ---
    private startTimer(duration: number, pollId: string) {
        this.stopTimer();
        this.currentTimer = duration;

        this.emit('timer_sync', this.currentTimer);

        this.timerInterval = setInterval(async () => {
            this.currentTimer -= 1;
            this.emit('timer_sync', this.currentTimer);

            if (this.currentTimer <= 0) {
                this.stopTimer();
                try {
                    const completedPoll = await this.completePoll(pollId);
                    this.emit('poll_results', completedPoll);
                } catch (err) {
                    console.error('Failed to complete poll automatically on timer expiration', err);
                }
            }
        }, 1000);
    }

    private stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

// Export a singleton instance
export const PollService = new PollServiceClass();
