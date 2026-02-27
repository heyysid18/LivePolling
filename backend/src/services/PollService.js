"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollService = void 0;
const Poll_1 = __importDefault(require("../models/Poll"));
const Vote_1 = __importDefault(require("../models/Vote"));
const mongoose_1 = __importDefault(require("mongoose"));
const events_1 = require("events");
class PollServiceClass extends events_1.EventEmitter {
    timerInterval = null;
    currentTimer = 0;
    activePollId = null;
    constructor() {
        super();
        this.resumeActivePolls();
    }
    /**
     * Recovers any active poll from the DB on server restart and resumes its timer.
     */
    async resumeActivePolls() {
        try {
            const activePoll = await Poll_1.default.findOne({ status: 'active' });
            if (activePoll) {
                const remaining = this.getRemainingTime(activePoll);
                if (remaining > 0) {
                    this.activePollId = activePoll._id.toString();
                    this.startTimer(remaining, this.activePollId);
                    console.log(`[PollService] Resumed timer for active poll ${this.activePollId} (${remaining}s remaining)`);
                }
                else {
                    // Time already expired while server was offline
                    await this.completePoll(activePoll._id.toString());
                    console.log(`[PollService] Completed expired active poll ${activePoll._id} on boot`);
                }
            }
        }
        catch (err) {
            console.error('Failed to resume active polls on startup', err);
        }
    }
    /**
     * Creates a new poll. Automatically completes any existing active poll.
     */
    async createPoll(question, options, duration, createdBy) {
        // End any currently active polls in DB
        await Poll_1.default.updateMany({ status: 'active' }, { status: 'completed' });
        this.stopTimer(); // Clear existing in-memory timer
        const newPoll = new Poll_1.default({
            question,
            options: options.map(opt => ({ ...opt, votes: 0 })),
            duration,
            createdBy,
            status: 'active'
        });
        const savedPoll = await newPoll.save();
        this.activePollId = savedPoll._id.toString();
        this.startTimer(duration, this.activePollId);
        return savedPoll;
    }
    /**
     * Retrieves the currently active poll, if any.
     */
    async getActivePoll() {
        return await Poll_1.default.findOne({ status: 'active' });
    }
    /**
     * Completes a specific poll.
     */
    async completePoll(pollId) {
        const completedPoll = await Poll_1.default.findByIdAndUpdate(pollId, { status: 'completed' }, { new: true });
        if (this.activePollId === pollId) {
            this.stopTimer();
            this.activePollId = null;
        }
        return completedPoll;
    }
    /**
     * Forces a poll to end early (e.g. triggered by teacher).
     */
    async endPoll(pollId) {
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
    async castVote(pollId, studentId, studentName, selectedOption) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // 1. Check if poll exists and is active
            const poll = await Poll_1.default.findById(pollId).session(session);
            if (!poll)
                throw new Error('Poll not found');
            if (poll.status !== 'active')
                throw new Error('Poll is no longer active');
            // 2. Prevent duplicate votes via DB
            const existingVote = await Vote_1.default.findOne({ pollId, studentId }).session(session);
            if (existingVote)
                throw new Error('You have already voted on this poll');
            // 3. Record the vote
            const vote = new Vote_1.default({ pollId, studentId, studentName, selectedOption });
            await vote.save({ session });
            // 4. Increment the option vote count atomically
            const updatedPoll = await Poll_1.default.findOneAndUpdate({ _id: pollId, 'options.id': selectedOption }, { $inc: { 'options.$.votes': 1 } }, { new: true, session });
            if (!updatedPoll)
                throw new Error('Failed to update poll totals');
            await session.commitTransaction();
            return updatedPoll;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Gets specific student's vote for a poll
     */
    async getStudentVote(pollId, studentId) {
        return await Vote_1.default.findOne({ pollId, studentId });
    }
    /**
     * Calculates and returns results for a poll
     */
    async calculateResults(pollId) {
        const poll = await Poll_1.default.findById(pollId);
        if (!poll)
            throw new Error('Poll not found');
        return poll.options;
    }
    /**
     * Calculates the exact remaining time based on startTime.
     */
    getRemainingTime(poll) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(poll.startTime).getTime()) / 1000);
        return Math.max(0, poll.duration - elapsedSeconds);
    }
    // --- Private Timer Logic ---
    startTimer(duration, pollId) {
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
                }
                catch (err) {
                    console.error('Failed to complete poll automatically on timer expiration', err);
                }
            }
        }, 1000);
    }
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}
// Export a singleton instance
exports.PollService = new PollServiceClass();
//# sourceMappingURL=PollService.js.map