import { IPoll, IPollOption } from '../models/Poll';
import { IVote } from '../models/Vote';
import { EventEmitter } from 'events';
declare class PollServiceClass extends EventEmitter {
    private timerInterval;
    private currentTimer;
    private activePollId;
    constructor();
    /**
     * Recovers any active poll from the DB on server restart and resumes its timer.
     */
    private resumeActivePolls;
    /**
     * Creates a new poll. Automatically completes any existing active poll.
     */
    createPoll(question: string, options: {
        id: string;
        text: string;
    }[], duration: number, createdBy: string): Promise<IPoll>;
    /**
     * Retrieves the currently active poll, if any.
     */
    getActivePoll(): Promise<IPoll | null>;
    /**
     * Completes a specific poll.
     */
    completePoll(pollId: string): Promise<IPoll | null>;
    /**
     * Forces a poll to end early (e.g. triggered by teacher).
     */
    endPoll(pollId: string): Promise<IPoll | null>;
    /**
     * Records a vote for a student. Returns updated poll or throws error if duplicate.
     */
    castVote(pollId: string, studentId: string, studentName: string, selectedOption: string): Promise<IPoll>;
    /**
     * Gets specific student's vote for a poll
     */
    getStudentVote(pollId: string, studentId: string): Promise<IVote | null>;
    /**
     * Calculates and returns results for a poll
     */
    calculateResults(pollId: string): Promise<IPollOption[]>;
    /**
     * Calculates the exact remaining time based on startTime.
     */
    getRemainingTime(poll: IPoll): number;
    private startTimer;
    private stopTimer;
}
export declare const PollService: PollServiceClass;
export {};
//# sourceMappingURL=PollService.d.ts.map